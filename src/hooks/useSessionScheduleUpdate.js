// Importa hooks de React
import { useState, useEffect } from "react";

// Importa hook para obtener parámetros de la URL
import { useParams } from "react-router-dom";

// Importa cliente de API
import { api } from "../services/apiClient";

// Importa función de validación
import { validarCamposReact } from "../utils/validators";

// Importa utilidades de alertas
import { success, error } from "../utils/alertas";

/**
 * Esquema de validación para actualizar sesión de horario.
 * 
 * Define reglas de validación para cada campo:
 * - day_id: select obligatorio (día de la semana)
 * - time_slot_id: select obligatorio (franja horaria: mañana/tarde)
 * - start_time: texto obligatorio (hora de inicio, ej: "08:00")
 * - end_time: texto obligatorio (hora de fin, ej: "10:00")
 * - instructor_id: select obligatorio (instructor asignado)
 * - classroom_id: select obligatorio (ambiente/salón asignado)
 * 
 * @constant
 * @type {Array<Object>}
 */
const sessionSchema = [
  { name: "day_id", type: "select", required: true },
  { name: "time_slot_id", type: "select", required: true },
  { name: "start_time", type: "text", required: true },
  { name: "end_time", type: "text", required: true },
  { name: "instructor_id", type: "select", required: true },
  { name: "classroom_id", type: "select", required: true },
];

/**
 * Mapea un objeto de sesión al formato del formulario.
 * 
 * Transforma los datos anidados de la sesión (con objetos relacionados)
 * a strings planos que pueden ser usados en inputs/selects.
 * 
 * @function
 * @param {Object|null} session - Objeto de sesión del backend
 * @returns {Object} Objeto con valores del formulario
 * 
 * @example
 * const session = {
 *   day: { id: 1, name: "Lunes" },
 *   time_slot: { id: 2, name: "Mañana" },
 *   start_time: "08:00",
 *   end_time: "10:00",
 *   instructor: { id: 5 },
 *   classroom: { id: 3 }
 * };
 * 
 * mapSessionToForm(session);
 * // Retorna:
 * // {
 * //   day_id: "1",
 * //   time_slot_id: "2",
 * //   start_time: "08:00",
 * //   end_time: "10:00",
 * //   instructor_id: "5",
 * //   classroom_id: "3"
 * // }
 */
function mapSessionToForm(session) {
  // Si no hay sesión, retorna formulario vacío
  if (!session) {
    return {
      day_id: "",
      time_slot_id: "",
      start_time: "",
      end_time: "",
      instructor_id: "",
      classroom_id: "",
    };
  }

  // Extrae IDs de objetos relacionados y convierte a string
  return {
    day_id: session.day?.id ? String(session.day.id) : "",
    time_slot_id: session.time_slot?.id ? String(session.time_slot.id) : "",
    start_time: session.start_time || "",
    end_time: session.end_time || "",
    instructor_id: session.instructor?.id ? String(session.instructor.id) : "",
    classroom_id: session.classroom?.id ? String(session.classroom.id) : "",
  };
}

/**
 * Hook personalizado para actualizar una sesión de horario.
 * 
 * Gestiona la edición de una sesión específica dentro de un horario de ficha.
 * Obtiene los parámetros de la URL (fichaId, fichaTermId, scheduleId, sessionId),
 * carga los datos del horario y la sesión, y permite actualizarla.
 * 
 * Flujo:
 * 1. Obtiene parámetros de la URL
 * 2. Carga el horario completo del backend
 * 3. Busca la sesión específica dentro del horario
 * 4. Inicializa formulario con datos de la sesión
 * 5. Permite editar y guardar cambios
 * 
 * Casos de uso:
 * - Cambiar instructor de una sesión
 * - Cambiar ambiente/salón
 * - Modificar horarios
 * - Cambiar día o franja horaria
 * 
 * @hook
 * 
 * @returns {Object} Objeto con estados y funciones
 * @returns {string} returns.fichaId - ID de la ficha (de URL)
 * @returns {string} returns.fichaTermId - ID del trimestre (de URL)
 * @returns {string} returns.scheduleId - ID del horario (de URL)
 * @returns {string} returns.sessionId - ID de la sesión (de URL)
 * @returns {Object|null} returns.schedule - Objeto completo del horario
 * @returns {Object|null} returns.session - Objeto de la sesión específica
 * @returns {Object} returns.form - Estado del formulario
 * @returns {Object} returns.errors - Errores de validación
 * @returns {boolean} returns.loading - Estado de carga durante guardado
 * @returns {Function} returns.onChange - Handler para cambios en inputs
 * @returns {Function} returns.validateAndSave - Validar y guardar sesión
 * 
 * @example
 * // En la ruta: /fichas/123/terms/456/schedules/789/sessions/101/edit
 * function SessionEditPage() {
 *   const {
 *     form,
 *     errors,
 *     loading,
 *     session,
 *     onChange,
 *     validateAndSave
 *   } = useSessionScheduleUpdate();
 *   
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     const result = await validateAndSave();
 *     if (result.ok) {
 *       navigate(-1); // Volver atrás
 *     }
 *   };
 *   
 *   if (!session) return <div>Cargando...</div>;
 *   
 *   return (
 *     <form onSubmit={handleSubmit}>
 *       <InputField
 *         label="Día"
 *         name="day_id"
 *         value={form.day_id}
 *         onChange={onChange}
 *         options={days}
 *       />
 *       <button disabled={loading}>Actualizar</button>
 *     </form>
 *   );
 * }
 */
export default function useSessionScheduleUpdate() {
  
  /**
   * Extrae parámetros de la URL usando useParams de react-router-dom.
   * 
   * Ruta esperada:
   * /fichas/:fichaId/terms/:fichaTermId/schedules/:scheduleId/sessions/:sessionId/edit
   */
  const { fichaId, fichaTermId, scheduleId, sessionId } = useParams();

  // Estado para almacenar el horario completo
  const [schedule, setSchedule] = useState(null);
  
  // Estado para almacenar la sesión específica a editar
  const [session, setSession] = useState(null);
  
  // Estado del formulario (inicializado vacío)
  const [form, setForm] = useState(mapSessionToForm(null));
  
  // Estado de errores de validación
  const [errors, setErrors] = useState({});
  
  // Estado de carga durante guardado
  const [loading, setLoading] = useState(false);

  /**
   * Efecto para cargar el horario completo.
   * 
   * Se ejecuta cuando scheduleId cambia.
   * Obtiene el horario del backend que contiene todas sus sesiones.
   */
  useEffect(() => {
    // Si no hay scheduleId, no hace nada
    if (!scheduleId) return;

    /**
     * Función async para cargar el horario.
     */
    const fetchSchedule = async () => {
      try {
        // Obtiene el horario del backend
        const res = await api.get(`schedules/${scheduleId}`);
        
        // Si es exitoso, guarda el horario en el estado
        if (res.ok) setSchedule(res.data);
        
      } catch (e) {
        // Log de error para debugging
        console.error("Error schedule:", e);
      }
    };

    fetchSchedule();
  }, [scheduleId]); // Re-ejecuta si scheduleId cambia

  /**
   * Efecto para encontrar y cargar la sesión específica.
   * 
   * Se ejecuta cuando schedule o sessionId cambian.
   * Busca la sesión dentro del array de sesiones del horario.
   */
  useEffect(() => {
    // Si no hay horario o sessionId, no hace nada
    if (!schedule || !sessionId) return;
    
    /**
     * Busca la sesión específica en el array de sesiones.
     * 
     * Compara IDs como strings para evitar problemas de tipo.
     */
    const found = schedule.sessions?.find((s) => String(s.id) === String(sessionId));
    
    // Guarda la sesión encontrada (o null si no existe)
    setSession(found || null);
    
    // Inicializa el formulario con los datos de la sesión
    setForm(mapSessionToForm(found || null));
    
  }, [schedule, sessionId]); // Re-ejecuta si schedule o sessionId cambian

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * @param {Event} e - Evento change del input
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    
    // Actualiza el campo en el estado
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Limpia error del campo si existe
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Valida y guarda los cambios de la sesión.
   * 
   * Proceso:
   * 1. Valida campos según sessionSchema
   * 2. Construye payload con datos transformados
   * 3. Envía PATCH al backend
   * 4. Muestra alerta de éxito o error
   * 5. Retorna resultado
   * 
   * @async
   * @returns {Promise<Object|boolean>} Objeto {ok: true} o false si falla
   */
  const validateAndSave = async () => {
    // Valida el formulario
    const result = validarCamposReact(form, sessionSchema);
    
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      /**
       * Construye payload con todos los campos.
       * 
       * Incluye schedule_id para mantener la relación.
       * Convierte IDs a números.
       */
      const payload = {
        schedule_id: Number(scheduleId),
        day_id: Number(form.day_id),
        time_slot_id: Number(form.time_slot_id),
        start_time: form.start_time,
        end_time: form.end_time,
        instructor_id: Number(form.instructor_id),
        classroom_id: Number(form.classroom_id),
      };

      // Envía PATCH al endpoint de la sesión específica
      const res = await api.patch(`schedule_sessions/${sessionId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el día.");
        return false;
      }

      await success(res.message || "Día actualizado con éxito.");
      
      // Retorna objeto indicando éxito
      return { ok: true };
      
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
      
    } finally {
      setLoading(false);
    }
  };

  // Retorna todos los estados y funciones
  return {
    fichaId,           // ID de ficha (de URL)
    fichaTermId,       // ID de trimestre (de URL)
    scheduleId,        // ID de horario (de URL)
    sessionId,         // ID de sesión (de URL)
    schedule,          // Objeto del horario completo
    session,           // Objeto de la sesión específica
    form,              // Estado del formulario
    errors,            // Errores de validación
    loading,           // Estado de carga
    onChange,          // Handler de cambios
    validateAndSave,   // Función de guardado
  };
}