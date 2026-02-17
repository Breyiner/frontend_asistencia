// Importa hooks de React para manejo de estado y efectos secundarios
import { useEffect, useState, useCallback } from "react";

// Importa hook de navegación para redirección después de eliminar
import { useNavigate } from "react-router-dom";

// Importa cliente de API para comunicación con el backend
import { api } from "../services/apiClient";

// Importa función de validación personalizada
import { validarCamposReact } from "../utils/validators";

// Importa utilidades de alertas (SweetAlert2 o similar)
import { success, error, confirm } from "../utils/alertas";

/**
 * Esquema base de validación para clase real.
 * 
 * Define las reglas de validación para los campos obligatorios:
 * - instructor_id: select obligatorio (instructor que imparte la clase)
 * - classroom_id: select obligatorio (ambiente/salón donde se da la clase)
 * - time_slot_id: select obligatorio (franja horaria: mañana/tarde/noche)
 * - schedule_session_id: select obligatorio (sesión del horario base)
 * - class_type_id: select obligatorio (tipo: normal, recuperación, reposición)
 * - start_hour: texto obligatorio (hora de inicio en formato HH:MM)
 * - end_hour: texto obligatorio (hora de fin en formato HH:MM)
 * - observations: texto opcional, máximo 500 caracteres
 * 
 * Nota: Si class_type_id es "3" (reposición), se agregará dinámicamente
 * validación para original_date (fecha de la clase original que se repone).
 * 
 * @constant
 * @type {Array<Object>}
 */
const baseSchema = [
  { name: "instructor_id", type: "select", required: true },
  { name: "classroom_id", type: "select", required: true },
  { name: "time_slot_id", type: "select", required: true },

  { name: "schedule_session_id", type: "select", required: true },

  { name: "class_type_id", type: "select", required: true },
  { name: "start_hour", type: "text", required: true },
  { name: "end_hour", type: "text", required: true },
  { name: "observations", type: "text", required: false, maxLength: 500 },
];

/**
 * Normaliza un valor de tiempo a formato HH:MM.
 * 
 * Los backends pueden retornar tiempos en diferentes formatos:
 * - "08:00:00" (con segundos)
 * - "08:00" (sin segundos)
 * - null/undefined
 * 
 * Esta función asegura que siempre tengamos HH:MM para inputs tipo time.
 * 
 * @function
 * @param {string|null|undefined} t - Valor de tiempo del backend
 * @returns {string} Tiempo en formato HH:MM o string vacío
 * 
 * @example
 * normalizeTime("08:00:00")  // "08:00"
 * normalizeTime("14:30")     // "14:30"
 * normalizeTime(null)        // ""
 * normalizeTime(undefined)   // ""
 */
function normalizeTime(t) {
  // Si el valor es null, undefined o string vacío, retorna vacío
  if (!t) return "";
  
  // Convierte a string y toma solo los primeros 5 caracteres (HH:MM)
  // Esto elimina los segundos si existen (HH:MM:SS → HH:MM)
  return String(t).slice(0, 5);
}

/**
 * Mapea un objeto de clase real del backend al formato del formulario.
 * 
 * Transforma los datos anidados del backend (con objetos relacionados)
 * a strings planos que pueden ser usados en inputs y selects.
 * 
 * La estructura del backend tiene relaciones anidadas:
 * {
 *   instructor: { id: 5, full_name: "Juan" },
 *   classroom: { id: 3, name: "301" },
 *   ficha: { id: 2, number: "2558971" },
 *   ...
 * }
 * 
 * Esta función extrae solo los IDs y valores necesarios para el formulario.
 * 
 * @function
 * @param {Object|null} realClass - Objeto de clase real del backend
 * @returns {Object} Objeto con valores del formulario (todos strings)
 * 
 * @example
 * const realClass = {
 *   ficha: { id: 2 },
 *   instructor: { id: 5 },
 *   classroom: { id: 3 },
 *   time_slot: { id: 1 },
 *   schedule_session: { id: 7 },
 *   class_type: { id: 2 },
 *   start_hour: "08:00:00",
 *   end_hour: "10:00:00",
 *   observations: "Clase normal",
 *   original_date: "2024-01-15"
 * };
 * 
 * mapRealClassToForm(realClass);
 * // Retorna:
 * // {
 * //   ficha_id: "2",
 * //   instructor_id: "5",
 * //   classroom_id: "3",
 * //   time_slot_id: "1",
 * //   schedule_session_id: "7",
 * //   class_type_id: "2",
 * //   start_hour: "08:00",
 * //   end_hour: "10:00",
 * //   observations: "Clase normal",
 * //   original_date: "2024-01-15"
 * // }
 */
function mapRealClassToForm(realClass) {
  return {
    // ID de la ficha: extrae del objeto anidado y convierte a string
    // Solo para visualización, generalmente no se puede cambiar
    ficha_id: realClass?.ficha?.id ? String(realClass.ficha.id) : "",

    // ID del instructor: extrae y convierte a string
    instructor_id: realClass?.instructor?.id ? String(realClass.instructor.id) : "",
    
    // ID del ambiente/salón: extrae y convierte a string
    classroom_id: realClass?.classroom?.id ? String(realClass.classroom.id) : "",
    
    // ID de la franja horaria: extrae y convierte a string
    time_slot_id: realClass?.time_slot?.id ? String(realClass.time_slot.id) : "",

    // ID de la sesión del horario: extrae y convierte a string
    schedule_session_id: realClass?.schedule_session?.id ? String(realClass.schedule_session.id) : "",

    // ID del tipo de clase: extrae y convierte a string
    class_type_id: realClass?.class_type?.id ? String(realClass.class_type.id) : "",
    
    // Hora de inicio: normaliza a formato HH:MM
    start_hour: normalizeTime(realClass?.start_hour),
    
    // Hora de fin: normaliza a formato HH:MM
    end_hour: normalizeTime(realClass?.end_hour),

    // Observaciones: usa valor del backend o string vacío
    observations: realClass?.observations || "",

    // Fecha original (solo para clases tipo "reposición")
    // Es la fecha de la clase que se está reponiendo
    original_date: realClass?.original_date || "",
  };
}

/**
 * Hook personalizado para mostrar y editar una clase real.
 * 
 * Una "clase real" es una clase que efectivamente se dictó,
 * diferente del horario planificado. Puede ser:
 * - Clase normal (según horario)
 * - Clase de recuperación
 * - Clase de reposición (repone una clase perdida)
 * 
 * Gestiona:
 * - Carga de datos de la clase
 * - Modo visualización vs edición
 * - Validación dinámica (cambia según tipo de clase)
 * - Guardado de cambios
 * - Eliminación de la clase
 * 
 * Característica especial:
 * Si class_type_id es "3" (reposición), se requiere original_date.
 * Esta validación se agrega dinámicamente en tiempo de ejecución.
 * 
 * @hook
 * 
 * @param {string|number} realClassId - ID de la clase real a mostrar/editar
 * 
 * @returns {Object} Objeto con estados y funciones
 * @returns {Object|null} returns.realClass - Datos completos de la clase
 * @returns {boolean} returns.loading - Carga inicial
 * @returns {boolean} returns.isEditing - Modo edición activo
 * @returns {Object} returns.form - Estado del formulario
 * @returns {Object} returns.errors - Errores de validación
 * @returns {boolean} returns.saving - Guardando/eliminando
 * @returns {Function} returns.startEdit - Activar edición
 * @returns {Function} returns.cancelEdit - Cancelar edición
 * @returns {Function} returns.onChange - Handler de cambios
 * @returns {Function} returns.save - Guardar cambios
 * @returns {Function} returns.deleteRealClass - Eliminar clase
 * @returns {Function} returns.refetch - Recargar datos
 * 
 * @example
 * function RealClassShowPage() {
 *   const { id } = useParams();
 *   const {
 *     realClass,
 *     loading,
 *     isEditing,
 *     form,
 *     errors,
 *     onChange,
 *     save,
 *     deleteRealClass
 *   } = useRealClassShow(id);
 *   
 *   if (loading) return <div>Cargando...</div>;
 *   
 *   return (
 *     <div>
 *       {isEditing ? (
 *         <form>
 *           <InputField
 *             name="class_type_id"
 *             value={form.class_type_id}
 *             onChange={onChange}
 *             options={classTypes}
 *           />
 *           {form.class_type_id === "3" && (
 *             <InputField
 *               name="original_date"
 *               type="date"
 *               value={form.original_date}
 *               onChange={onChange}
 *               error={errors.original_date}
 *             />
 *           )}
 *           <Button onClick={save}>Guardar</Button>
 *         </form>
 *       ) : (
 *         <Details realClass={realClass} />
 *       )}
 *     </div>
 *   );
 * }
 */
export default function useRealClassShow(realClassId) {
  
  // Hook de navegación para redirección después de eliminar
  const navigate = useNavigate();

  // Estado para almacenar los datos completos de la clase real
  const [realClass, setRealClass] = useState(null);
  
  // Estado de carga durante fetch inicial
  const [loading, setLoading] = useState(false);

  // Estado de modo edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado del formulario de edición
  const [form, setForm] = useState(mapRealClassToForm(null));
  
  // Estado de errores de validación
  const [errors, setErrors] = useState({});
  
  // Estado de guardado/eliminación
  const [saving, setSaving] = useState(false);

  /**
   * Función memoizada para cargar la clase real del backend.
   * 
   * Memoizada con useCallback para:
   * - Mantener referencia estable
   * - Permitir uso seguro como dependencia en useEffect
   * 
   * @async
   * @callback
   */
  const fetchRealClass = useCallback(async () => {
    // Si no hay ID, no hace nada
    if (!realClassId) return;

    // Activa estado de carga
    setLoading(true);
    
    try {
      // Obtiene la clase real del backend
      const res = await api.get(`real_classes/${realClassId}`);
      
      // Extrae datos si es exitoso, null si falló
      const item = res?.ok ? res?.data : null;
      
      // Guarda en el estado
      setRealClass(item);
      
    } finally {
      // Siempre desactiva loading
      setLoading(false);
    }
  }, [realClassId]); // Se recrea solo si realClassId cambia

  /**
   * Efecto para cargar datos al montar o cuando cambia el ID.
   */
  useEffect(() => {
    fetchRealClass();
  }, [fetchRealClass]);

  /**
   * Efecto para sincronizar formulario con datos cargados.
   * 
   * Actualiza el formulario cuando se cargan nuevos datos.
   */
  useEffect(() => {
    // Si no hay datos, no hace nada
    if (!realClass) return;
    
    // Actualiza formulario con los datos actuales
    setForm(mapRealClassToForm(realClass));
  }, [realClass, isEditing]);

  /**
   * Activa el modo de edición.
   * 
   * @callback
   */
  const startEdit = useCallback(() => {
    // Activa modo edición
    setIsEditing(true);
    
    // Limpia errores previos
    setErrors({});
  }, []);

  /**
   * Cancela la edición y restaura el formulario.
   * 
   * @callback
   */
  const cancelEdit = useCallback(() => {
    // Desactiva modo edición
    setIsEditing(false);
    
    // Limpia errores
    setErrors({});
    
    // Restaura datos originales
    setForm(mapRealClassToForm(realClass));
  }, [realClass]);

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * Característica especial:
   * Si el usuario cambia class_type_id a un valor diferente de "3",
   * automáticamente limpia el campo original_date (ya que solo
   * las clases de tipo "reposición" necesitan ese campo).
   * 
   * @callback
   * @param {Event} e - Evento change del input
   */
  const onChange = useCallback(
    (e) => {
      // Extrae name y value del input
      const { name, value } = e.target;

      // Actualiza el formulario
      setForm((prev) => {
        // Crea nuevo objeto con el campo actualizado
        const next = { ...prev, [name]: value };

        // Lógica especial: si cambia class_type_id y NO es "3"
        // (tipo reposición), limpia original_date
        if (name === "class_type_id" && String(value) !== "3") {
          next.original_date = "";
        }

        // Retorna el nuevo estado
        return next;
      });

      // Si había error en este campo, lo limpia
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors] // Depende de errors para limpiar errores
  );

  /**
   * Valida y guarda los cambios de la clase.
   * 
   * Validación dinámica:
   * - Crea copia del esquema base
   * - Si class_type_id es "3" (reposición), agrega validación de original_date
   * - Esto hace que original_date sea obligatorio solo para reposiciones
   * 
   * @async
   * @callback
   * @returns {Promise<boolean>} true si guardó exitosamente
   */
  const save = useCallback(async () => {
    /**
     * Crea esquema de validación dinámico.
     * 
     * Comienza con baseSchema y agrega campos según el tipo de clase.
     */
    const schema = [...baseSchema]; // Copia del esquema base
    
    // Si es clase de reposición (tipo "3"), agrega validación de fecha original
    if (String(form.class_type_id) === "3") {
      schema.push({ name: "original_date", type: "date", required: true });
    }

    // Valida el formulario con el esquema dinámico
    const result = validarCamposReact(form, schema);
    
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      /**
       * Construye payload con lógica condicional.
       * 
       * original_date solo se incluye si class_type_id es "3".
       * Si no es "3", se envía como null explícitamente.
       */
      const payload = {
        instructor_id: Number(form.instructor_id),
        classroom_id: Number(form.classroom_id),
        time_slot_id: Number(form.time_slot_id),

        schedule_session_id: Number(form.schedule_session_id),

        class_type_id: Number(form.class_type_id),
        start_hour: form.start_hour,
        end_hour: form.end_hour,
        observations: form.observations?.trim() || null,

        // Lógica condicional: incluye original_date solo para reposiciones
        // Para otros tipos, envía null explícitamente para limpiar el campo
        original_date: String(form.class_type_id) === "3" ? (form.original_date || null) : null,
      };
      
      // Envía PATCH al backend
      const res = await api.patch(`real_classes/${realClassId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar la clase.");
        return false;
      }

      // Éxito
      await success(res.message || "Clase actualizada con éxito.");
      setIsEditing(false);
      await fetchRealClass(); // Recarga datos
      return true;
      
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
      
    } finally {
      setSaving(false);
    }
  }, [form, realClassId, fetchRealClass]); // Dependencias necesarias

  /**
   * Elimina la clase real después de confirmación.
   * 
   * @async
   * @callback
   * @returns {Promise<boolean>} true si eliminó, false si canceló o falló
   */
  const deleteRealClass = useCallback(async () => {
    // Muestra diálogo de confirmación
    const confirmed = await confirm("¿Eliminar esta clase permanentemente?");
    
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      // Envía DELETE
      const res = await api.delete(`real_classes/${realClassId}`);
      
      if (!res.ok) {
        await error(res.message || "No se pudo eliminar.");
        return false;
      }

      // Éxito
      await success("Clase eliminada!");
      
      // Redirige a la lista de clases
      navigate("/real_classes");
      return true;
      
    } catch (e) {
      await error(e?.message || "Error al eliminar.");
      return false;
      
    } finally {
      setSaving(false);
    }
  }, [realClassId, navigate]);

  // Retorna estados y funciones
  return {
    realClass,            // Datos de la clase
    loading,              // Carga inicial

    isEditing,            // Modo edición
    form,                 // Estado del formulario
    errors,               // Errores de validación
    saving,               // Guardando/eliminando

    startEdit,            // Activar edición
    cancelEdit,           // Cancelar edición
    onChange,             // Handler de cambios
    save,                 // Guardar cambios
    deleteRealClass,      // Eliminar clase

    refetch: fetchRealClass,  // Recargar datos
  };
}