import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";               // Para extraer params de la URL (fichaId, etc.)
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

// Esquema de validación fijo para creación de sesión en horario
const sessionSchema = [
  { name: "day_id",         type: "select", required: true },
  { name: "time_slot_id",   type: "select", required: true },
  { name: "start_time",     type: "text",   required: true },    // Formato HH:mm esperado
  { name: "end_time",       type: "text",   required: true },
  { name: "instructor_id",  type: "select", required: true },
  { name: "classroom_id",   type: "select", required: true },
];

/**
 * Hook para CREAR una nueva sesión dentro de un horario (schedule_sessions).
 * 
 * Contexto:
 * - Se usa en rutas como /fichas/:fichaId/terminos/:fichaTermId/horarios/:scheduleId/sesiones/crear
 * - Crea una asignación concreta de día + franja + instructor + aula en un horario existente
 * - No maneja edición (solo creación)
 */
export default function useSessionScheduleCreate() {
  // Extraemos params de la ruta actual (React Router v6+)
  const { fichaId, fichaTermId, scheduleId } = useParams();

  // Datos del horario padre (cargado para contexto, aunque no siempre usado en UI)
  const [schedule, setSchedule] = useState(null);

  // Estado del formulario de la nueva sesión
  const [form, setForm] = useState({
    day_id: "",
    time_slot_id: "",
    start_time: "",
    end_time: "",
    instructor_id: "",
    classroom_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  /**
   * Carga los datos del horario padre (opcional, pero útil para validaciones o mostrar info)
   */
  useEffect(() => {
    if (!scheduleId) return;

    const fetchSchedule = async () => {
      try {
        const res = await api.get(`schedules/${scheduleId}`);
        if (res.ok) {
          setSchedule(res.data);
        }
      } catch (e) {
        console.error("Error al cargar horario padre:", e);
        // No mostramos alerta al usuario → fallo silencioso (no crítico)
      }
    };

    fetchSchedule();
  }, [scheduleId]);

  /**
   * Manejador genérico de cambios en el formulario
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Limpieza reactiva de error al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * Valida y crea la nueva sesión en la API.
   * @returns {Promise<{ok: boolean}> | false}
   */
  const validateAndSave = async () => {
    const result = validarCamposReact(form, sessionSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      // Construcción del payload con conversiones de tipo obligatorias
      const payload = {
        schedule_id:    Number(scheduleId),           // Obligatorio desde params
        day_id:         Number(form.day_id),
        time_slot_id:   Number(form.time_slot_id),
        start_time:     form.start_time,              // Se valida formato en backend
        end_time:       form.end_time,
        instructor_id:  Number(form.instructor_id),
        classroom_id:   Number(form.classroom_id),
      };

      const res = await api.post(`schedule_sessions`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo asignar el día.");
        return false;
      }

      await success(res.message || "Día asignado con éxito.");
      return { ok: true };

    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    fichaId,          // Para contexto o breadcrumbs
    fichaTermId,
    scheduleId,
    schedule,         // Horario padre cargado
    form,
    errors,
    loading,
    onChange,
    validateAndSave,
  };
}