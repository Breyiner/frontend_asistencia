import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

/**
 * Schema específico para creación de fichas.
 * 
 * Ficha = grupo de aprendices en un programa específico.
 * 
 * Campos únicos de fichas:
 * - ficha_number: identificador único (ej: "24601467")
 * - gestor_id: administrador responsable de la ficha
 * - shift_id: turno (mañana/tarde)
 * 
 * @constant
 * @type {Array<Object>}
 */
const fichaCreateSchema = [
  // Número único identificador de la ficha
  { name: "ficha_number", type: "text", required: true, maxLength: 20 },
  // Programa de formación al que pertenece
  { name: "training_program_id", type: "select", required: true },
  // Gestor/administrador asignado
  { name: "gestor_id", type: "select", required: true },
  // Turno/jornada (mañana, tarde, noche)
  { name: "shift_id", type: "select", required: true },
  // Fecha de inicio del programa
  { name: "start_date", type: "date", required: true },
  // Fecha de finalización del programa
  { name: "end_date", type: "date", required: true },
];

/**
 * Hook para crear fichas desde cero.
 * 
 * [DESCRIPCIÓN COMPLETA EN EL BLOQUE JSDOC ARRIBA]
 */
export default function useFichaCreate() {
  // Estado inicial del formulario de ficha
  const [form, setForm] = useState({
    ficha_number: "",           // "24601467"
    training_program_id: "",    // ID del programa
    gestor_id: "",              // ID del gestor
    start_date: "",             // "2026-01-15"
    end_date: "",               // "2026-06-15"
  });

  // Errores específicos por campo
  const [errors, setErrors] = useState({});
  
  // Loading durante POST
  const [loading, setLoading] = useState(false);

  /**
   * Handler estándar para cambios en inputs.
   * 
   * 1. Extrae name/value del evento
   * 2. Actualiza form inmutable
   * 3. Limpia error del campo si existía
   */
  const onChange = (e) => {
    const { name, value } = e.target;  // Destructuración del target
    setForm((prev) => ({ ...prev, [name]: value }));  // Update inmutable
    if (errors[name]) {  // Limpieza inmediata de errores
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Valida y crea la ficha en el servidor.
   * 
   * **Validaciones dobles:**
   * 1. Schema automático (campos requeridos, formatos)
   * 2. Transformación segura de datos
   * 
   * **Payload especial:**
   * - IDs → Number (no strings)
   * - Fechas → null si vacías
   * 
   * @async
   * @returns {Promise<{ok: boolean, createdId?: number}|false>}
   */
  const validateAndSave = async () => {
    // Validación automática con schema
    const result = validarCamposReact(form, fichaCreateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);  // Bloquea botón

      /**
       * Payload limpio y tipado correctamente:
       * - trim() en strings
       * - Number() en IDs (no strings)
       * - null en campos vacíos
       */
      const payload = {
        ficha_number: form.ficha_number?.trim(),  // Identificador único
        training_program_id: form.training_program_id ? Number(form.training_program_id) : null,
        gestor_id: form.gestor_id ? Number(form.gestor_id) : null,
        shift_id: form.shift_id ? Number(form.shift_id) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };

      // POST /fichas → crea nueva ficha
      const res = await api.post("fichas", payload);
      
      if (!res.ok) {
        await error(res.message || "No se pudo crear la ficha.");
        return false;
      }

      // Extrae ID creado (maneja diferentes estructuras)
      const createdId = res?.data?.id ?? res?.data?.data?.id ?? null;
      
      await success(res.message || "Ficha creada con éxito.");
      return { ok: true, createdId };
    } catch (e) {
      console.error(e);  // Log para debugging
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);  // Desbloquea UI
    }
  };

  // API pública simple
  return { form, errors, loading, onChange, validateAndSave };
}
