/**
 * useFichaTermUpdate - Hook ULTRA-DETALLADO para EDITAR FichaTerm.
 * 
 * 🎯 DIFERENCIAS con Create:
 * 1. Carga FichaTerm/{fichaTermId} + popula form
 * 2. PATCH vs POST
 * 3. Valida !solapa OTROS FichaTerms (no se edita a sí mismo)
 * 
 * 📡 ENDPOINT: PATCH /api/fichaterms/{fichaTermId}
 * 
 * @function useFichaTermUpdate
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const fichaTermSchema = [ /* MISMO schema create */ ];

export default function useFichaTermUpdate() {
  const { fichaId, fichaTermId } = useParams();  
  // ↑ /fichas/:fichaId/terms/:fichaTermId/edit
  // ↑ 2 params → doble validación !fichaId || !fichaTermId

  const [form, setForm] = useState({ 
    term_id: "", phase_id: "", start_date: "", end_date: "" 
  });
  const [ficha, setFicha] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);  // ÚNICO loading (fetch+patch)

  // 🎬 useEffect 1: Carga FICHA (igual create)
  useEffect(() => {
    if (!fichaId) return;  // URL malformada
    
    const fetchFicha = async () => {
      try {
        const res = await api.get(`fichas/${fichaId}`);
        if (res.ok) setFicha(res.data);
      } catch (e) {
        console.error("Error ficha:", e);
      }
    };
    fetchFicha();
  }, [fichaId]);

  // 🎬 useEffect 2: Carga FICHA_TERM + POPULA FORM
  useEffect(() => {
    if (!fichaTermId) return;  // Edit sin ID → 404 padre
    
    const fetchFichaTerm = async () => {
      try {
        setLoading(true);  // Spinner durante fetch
        
        const res = await api.get(`ficha_terms/${fichaTermId}`);
        // ↑ GET /api/ficha_terms/456 → {id, ficha_id, term_id, phase_id, dates}
        
        if (!res.ok) return;  // 404 → form vacío (UI maneja)
        
        const item = res.data;
        // 🔥 POPULA FORM con datos actuales (String para <select>)
        setForm({
          term_id: item.term_id ? String(item.term_id) : "",
          phase_id: item.phase_id ? String(item.phase_id) : "",
          start_date: item.start_date || "",
          end_date: item.end_date || ""
        });
        // ↓ NO setFicha aquí (viene de useEffect 1)
      } catch (e) {
        console.error("Error fichaterm:", e);
      } finally {
        setLoading(false);  // Libera UI
      }
    };
    fetchFichaTerm();
  }, [fichaTermId]);  // 📍 Recarga si cambia /terms/456→457

  const onChange = (e) => {  // ÍDEM create (genérico)
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  /**
   * ✅ validateAndSave UPDATE (PATCH)
   * DIFERENCIA clave: NO manda ficha_id (ya existe relación)
   */
  const validateAndSave = async () => {
    const result = validarCamposReact(form, fichaTermSchema);
    if (!result.ok) {
      setErrors(result.errors);
      return false;
    }

    try {
      setLoading(true);
      
      const payload = {
        term_id: Number(form.term_id),     // "1" → 1
        phase_id: Number(form.phase_id),   // "2" → 2
        start_date: form.start_date,       // string YYYY-MM-DD
        end_date: form.end_date
        // ↓ NO ficha_id → PATCH solo cambia estos 4 campos
      };

      const res = await api.patch(`ficha_terms/${fichaTermId}`, payload);
      // ↑ /api/ficha_terms/456 → Controller@fichaTermUpdate

      if (!res.ok) {
        await error(res.message, "No se pudo actualizar el trimestre.");
        // ↑ Backend: "Fechas solapan T2", "Term ya existe"
        return false;
      }
      
      await success(res.message, "Trimestre actualizado con éxito!");
      // ↑ NO info() → NO recrea schedule (solo modifica fechas)
      
      return { ok: true };  // Componente puede refetch
    } catch (e) {
      await error(e?.message, "Error de conexión.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { 
    form, ficha, fichaId, fichaTermId,  // + fichaTermId nuevo
    errors, loading, onChange, validateAndSave 
  };
}
