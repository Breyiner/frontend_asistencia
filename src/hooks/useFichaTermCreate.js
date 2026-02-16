/**
 * useFichaTermCreate - Hook ULTRA-DETALLADO para CREAR trimestre en ficha.
 * 
 * 🎯 PROPÓSITO ESPECÍFICO:
 * 1. Carga ficha desde URL params (useParams)
 * 2. Valida term_id único (no duplicados en ficha)
 * 3. Backend valida solapamientos de fechas entre trimestres
 * 4. Auto-crea schedule vacío para nuevo FichaTerm
 * 5. UX: success + info("bloque horario creado")
 * 
 * 📡 ENDPOINT: POST /api/fichaterms
 * 🔐 REQUIERE: auth professor/coordinator
 * 
 * @function useFichaTermCreate
 * @returns {Object} Estados + handlers completos
 */
import { useState, useEffect } from "react";  
// ↑ useState: estado reactivo form/loading/errors (NO useReducer - simple)
// ↑ useEffect: carga ficha automática al montar (NO manual fetch)

import { useParams } from "react-router-dom";  
// ↑ Extrae :fichaId de URL /fichas/:fichaId/terms/create
// ↑ React Router v6+ hook (mejor que useRouteMatch)

import { api } from "../services/apiClient";  
// ↑ Axios instance con:
//   - baseURL: /api
//   - Authorization: Bearer {token} (auto-refresh)
//   - interceptors: 401→login, 422→errors[] parsing

import { validarCamposReact } from "../utils/validators";  
// ↑ Tu validador custom: 
//   Input: {form, schema} → Output: {ok:bool, errors:{campo:"msg"}}

import { success, error, info } from "../utils/alertas";  
// ↑ SweetAlert2 wrappers:
//   - success(msg, title) → verde + auto-close 2s
//   - error(msg, title) → rojo + botón OK
//   - info(msg, title) → azul info (bloque horario UX)

const fichaTermSchema = [
  { 
    name: "term_id", 
    type: "select", 
    required: true 
  // ↑ Trimestre 1,2,3 → Backend valida !EXISTS en ficha_terms
  // ↑ UI: <select> con options de catálogo trimestres
  },
  { 
    name: "phase_id", 
    type: "select", 
    required: true 
  // ↑ 1=lectiva, 2=electiva → enum DB phase_types
  },
  { 
    name: "start_date", 
    type: "date", 
    required: true 
  // ↑ YYYY-MM-DD → input type="date" HTML5
  // ↑ Backend: start_date >= ficha.start_date
  },
  { 
    name: "end_date", 
    type: "date", 
    required: true 
  // ↑ YYYY-MM-DD > start_date
  // ↑ Backend: !solapa otros ficha_terms + <= ficha.end_date
  }
];

export default function useFichaTermCreate() {
  const { fichaId } = useParams();  
  // ↑ STRING de URL → Number(fichaId) en payload
  // ↑ Edge case: si !fichaId → form disabled (UI feedback)

  // 🗂️ ESTADO FORM REACTIVO (inicial vacío para required UI)
  const [form, setForm] = useState({ 
    term_id: "",      // "" → placeholder "Selecciona trimestre"
    phase_id: "",     // "" → placeholder "Selecciona fase"  
    start_date: "",   // "" → input date vacío
    end_date: ""      // "" → input date vacío
  });

  // 📋 FICHA COMPLETA (con trimestres existentes → UI info)
  const [ficha, setFicha] = useState(null);  
  // ↑ null → loading spinner
  // ↑ {id, name, start_date, ficha_terms:[{term_id, phase_id, dates}]}

  // ❌ ERRORES POR CAMPO (de validator o backend 422)
  const [errors, setErrors] = useState({});  
  // ↑ {} vacío = form válido
  // ↑ {term_id: "Ya existe 1er trimestre", start_date: "Fecha inválida"}

  // ⏳ LOADING ÚNICO (fetch + submit)
  const [loading, setLoading] = useState(false);  
  // ↑ false inicial → botón habilitado
  // ↑ true → spinner + disabled inputs

  /**
   * 🎬 AUTO-CARGA FICHA al montar hook o cambiar :fichaId
   * 
   * ¿Por qué useEffect aquí? → UX: muestra nombre ficha + trimestres existentes
   * ¿Por qué !fichaId return? → URL malformada (404 componente padre)
   * ¿Por qué NO error toast? → Error silencioso (UI muestra "Ficha no encontrada")
   */
  useEffect(() => {
    if (!fichaId) return;  // Early return → evita fetch 404
    
    const fetchFicha = async () => {  // IIFE async para await
      try {
        const res = await api.get(`/fichas/${fichaId}`);  
        // ↑ GET /api/fichas/123 → {id, name, ficha_terms:[]}
        
        if (res.ok) {  // 200 → data válida
          setFicha(res.data);  // Trigger re-render con ficha
        }
        // ↓ NO else: 404/422 → ficha=null (UI maneja)
      } catch (e) {
        // ❌ SILENCIO: NO error toast (UX: loading → vacío)
        // Solo console para debug
        console.error("Error ficha:", e);  
      }
    };
    
    fetchFicha();  // Ejecuta async
  }, [fichaId]);  // 📍 DEPENDENCIA: recarga si cambia URL /fichas/123→124

  /**
   * ✏️ onChange GENÉRICO + LIMPIA ERROR
   * 
   * ¿Por qué limpiar errors[name]? → UX: error rojo desaparece al escribir
   * ¿Por qué e.target? → <input name="term_id" onChange={onChange} />
   */
  const onChange = (e) => {
    const { name, value } = e.target;  // Destructuring estándar form event
    
    setForm(prev => ({ 
      ...prev,  // Preserva otros campos
      [name]: value  // Actualiza SOLO campo editado
    }));
    
    if (errors[name]) {  // ¿Campo tenía error?
      setErrors(prev => ({ 
        ...prev, 
        [name]: ""  // Limpia SOLO este error
      }));
    }
    // ↓ NO setErrors({}) total → preserva otros errores
  };

  /**
   * ✅ validateAndSave - FLUJO COMPLETO CREACIÓN
   * 
   * PASO 1: Frontend validation (rápida, UX)
   * PASO 2: Normaliza payload (String→Number)
   * PASO 3: POST /fichaterms
   * PASO 4: Backend valida negocio (solapamientos, term único)
   * PASO 5: Auto-crea schedule vacío
   * PASO 6: UX feedback (success + info)
   * 
   * @returns {boolean|{ok:boolean}} false=error, {ok:true}=éxito
   */
  const validateAndSave = async () => {
    // PASO 1: VALIDACIÓN FRONTEND (instantánea)
    const result = validarCamposReact(form, fichaTermSchema);  
    // ↑ {ok:false, errors:{term_id:"Requerido"}} o {ok:true}
    
    if (!result.ok) {
      setErrors(result.errors);  // Pinta errores rojos
      return false;  // Early return
    }

    try {
      setLoading(true);  // Spinner + disable form

      // PASO 2: NORMALIZA PAYLOAD
      const payload = {
        ficha_id: Number(fichaId),        // "123" → 123
        term_id: Number(form.term_id),    // "1" → 1 (select value)
        phase_id: Number(form.phase_id),  // "2" → 2
        start_date: form.start_date,      // "2026-02-01" (string OK)
        end_date: form.end_date           // "2026-04-30"
      };
      // ↓ Backend asume ficha existe (from URL)

      // PASO 3: POST al backend
      const res = await api.post("/fichaterms", payload);  
      // ↑ /api/fichaterms → AttendanceController@fichaTermStore

      if (!res.ok) {  // 422/500
        await error(res.message, "No se pudo asociar el trimestre.");
        // ↑ Backend errores: "Term ya existe", "Fechas solapan"
        return false;
      }

      // PASO 4: ¡ÉXITO! UX doble feedback
      await success(res.message, "Trimestre asociado con éxito!");
      // ↑ res.message = "FichaTerm 456 creado"
      
      await info("Se creó un bloque de horario para este trimestre.");
      // ↑ UX extra: explica auto-creación schedule

      return { ok: true };  // Componente: resetForm()
      
    } catch (e) {
      // ❌ Network/500 → mensaje genérico
      await error(e?.message, "Error de conexión.");
      return false;
    } finally {
      setLoading(false);  // Siempre libera UI
    }
  };

  // 🎁 EXPORTA TODO (destructuring en componente)
  return {
    form,           // Bind <input value={form.term_id} />
    ficha,          // <h1>{ficha?.name}</h1> {ficha_terms.length} existentes
    fichaId,        // <p>Ficha #{fichaId}</p>
    errors,         // {term_id: <span className="error">Ya existe</span>}
    loading,        // disabled={loading} spinner={loading}
    onChange,       // onChange={onChange}
    validateAndSave // onClick={validateAndSave}
  };
}
