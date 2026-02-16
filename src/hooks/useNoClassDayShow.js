// Importa hooks de React
import { useEffect, useState, useCallback } from "react";

// Importa hook de navegación
import { useNavigate } from "react-router-dom";

// Importa cliente de API
import { api } from "../services/apiClient";

// Importa función de validación
import { validarCamposReact } from "../utils/validators";

// Importa utilidades de alertas
import { success, error, confirm } from "../utils/alertas";

/**
 * Esquema de validación para día sin clase.
 * 
 * Define las reglas de validación para actualización:
 * - ficha_id: select obligatorio (ID de la ficha)
 * - reason_id: select obligatorio (motivo del día sin clase)
 * - date: fecha obligatoria
 * - observations: texto opcional, máximo 1000 caracteres
 * 
 * @constant
 * @type {Array<Object>}
 */
const baseSchema = [
  { name: "ficha_id", type: "select", required: true },
  { name: "reason_id", type: "select", required: true },
  { name: "date", type: "date", required: true },
  { name: "observations", type: "text", required: false, maxLength: 1000 },
];

/**
 * Mapea un objeto de día sin clase al formato del formulario.
 * 
 * Transforma los datos del backend (IDs numéricos) a strings
 * para uso en inputs y selects de formulario.
 * 
 * @function
 * @param {Object|null} noClassDay - Objeto de día sin clase del backend
 * @returns {Object} Objeto con valores del formulario
 */
function mapNoClassDayToForm(noClassDay) {
  return {
    ficha_id: noClassDay?.ficha_id ? String(noClassDay.ficha_id) : "",
    reason_id: noClassDay?.reason_id ? String(noClassDay.reason_id) : "",
    date: noClassDay?.date || "",
    observations: noClassDay?.observations || "",
  };
}

/**
 * Hook personalizado para mostrar y editar un día sin clase.
 * 
 * Gestiona el ciclo completo de una página de detalle/edición:
 * - Carga inicial de datos del backend
 * - Modo visualización vs modo edición
 * - Validación y guardado de cambios
 * - Eliminación del registro
 * - Sincronización de estados
 * 
 * Patrón de uso:
 * 1. Carga datos en modo visualización (isEditing: false)
 * 2. Usuario activa modo edición (startEdit)
 * 3. Usuario modifica campos (onChange)
 * 4. Usuario guarda (save) o cancela (cancelEdit)
 * 5. Recarga datos actualizados del backend
 * 
 * @hook
 * 
 * @param {string|number} noClassDayId - ID del día sin clase a mostrar
 * 
 * @returns {Object} Objeto con estados y funciones
 * @returns {Object|null} returns.noClassDay - Datos completos del día sin clase
 * @returns {boolean} returns.loading - Estado de carga inicial
 * @returns {boolean} returns.isEditing - Si está en modo edición
 * @returns {Object} returns.form - Estado del formulario
 * @returns {Object} returns.errors - Errores de validación
 * @returns {boolean} returns.saving - Estado de guardado/eliminación
 * @returns {Function} returns.startEdit - Activa modo edición
 * @returns {Function} returns.cancelEdit - Cancela edición y restaura datos
 * @returns {Function} returns.onChange - Handler para cambios en campos
 * @returns {Function} returns.save - Guarda cambios
 * @returns {Function} returns.deleteNoClassDay - Elimina el registro
 * @returns {Function} returns.refetch - Recarga datos del backend
 * 
 * @example
 * // En página de detalle: /no_class_days/123
 * function NoClassDayShowPage() {
 *   const { id } = useParams();
 *   const {
 *     noClassDay,
 *     loading,
 *     isEditing,
 *     form,
 *     errors,
 *     saving,
 *     startEdit,
 *     cancelEdit,
 *     onChange,
 *     save,
 *     deleteNoClassDay
 *   } = useNoClassDayShow(id);
 *   
 *   if (loading) return <div>Cargando...</div>;
 *   if (!noClassDay) return <div>No encontrado</div>;
 *   
 *   return (
 *     <div>
 *       {isEditing ? (
 *         <form>
 *           <InputField name="ficha_id" value={form.ficha_id} onChange={onChange} />
 *           <Button onClick={save}>Guardar</Button>
 *           <Button onClick={cancelEdit}>Cancelar</Button>
 *         </form>
 *       ) : (
 *         <div>
 *           <InfoRow label="Ficha" value={noClassDay.ficha?.name} />
 *           <Button onClick={startEdit}>Editar</Button>
 *           <Button onClick={deleteNoClassDay}>Eliminar</Button>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 */
export default function useNoClassDayShow(noClassDayId) {
  
  // Hook de navegación para redirección después de eliminar
  const navigate = useNavigate();

  // Estado para almacenar los datos del día sin clase
  const [noClassDay, setNoClassDay] = useState(null);
  
  // Estado de carga durante fetch inicial
  const [loading, setLoading] = useState(false);

  // Estado que indica si está en modo edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado del formulario de edición
  const [form, setForm] = useState(mapNoClassDayToForm(null));
  
  // Estado de errores de validación
  const [errors, setErrors] = useState({});
  
  // Estado de carga durante guardado/eliminación
  const [saving, setSaving] = useState(false);

  /**
   * Función memoizada para cargar el día sin clase del backend.
   * 
   * useCallback evita recrear la función en cada render,
   * importante para el useEffect que depende de ella.
   * 
   * @async
   * @callback
   */
  const fetchNoClassDay = useCallback(async () => {
    // Si no hay ID, no hace nada
    if (!noClassDayId) return;

    setLoading(true);
    
    try {
      // Obtiene el día sin clase del backend
      const res = await api.get(`no_class_days/${noClassDayId}`);
      
      // Extrae los datos si la respuesta es exitosa
      const item = res?.ok ? res?.data : null;
      
      // Guarda en el estado
      setNoClassDay(item);
      
    } finally {
      // Siempre desactiva loading, incluso si hay error
      setLoading(false);
    }
  }, [noClassDayId]); // Se recrea solo si noClassDayId cambia

  /**
   * Efecto para cargar datos al montar o cuando cambia el ID.
   * 
   * Se ejecuta automáticamente cuando:
   * - El componente se monta
   * - noClassDayId cambia
   * - fetchNoClassDay cambia (pero está memoizada)
   */
  useEffect(() => {
    fetchNoClassDay();
  }, [fetchNoClassDay]);

  /**
   * Efecto para sincronizar formulario con datos cargados.
   * 
   * Actualiza el formulario cuando:
   * - Se cargan nuevos datos (noClassDay cambia)
   * - Se cambia entre modo edición y visualización
   */
  useEffect(() => {
    // Si no hay datos, no hace nada
    if (!noClassDay) return;
    
    // Actualiza formulario con los datos actuales
    setForm(mapNoClassDayToForm(noClassDay));
  }, [noClassDay, isEditing]);

  /**
   * Activa el modo de edición.
   * 
   * Memoizada con useCallback para estabilidad de referencia.
   * 
   * @callback
   */
  const startEdit = useCallback(() => {
    setIsEditing(true);      // Activa modo edición
    setErrors({});           // Limpia errores previos
  }, []);

  /**
   * Cancela la edición y restaura el formulario.
   * 
   * Descarta cambios no guardados y vuelve a modo visualización.
   * 
   * @callback
   */
  const cancelEdit = useCallback(() => {
    setIsEditing(false);                          // Desactiva modo edición
    setErrors({});                                // Limpia errores
    setForm(mapNoClassDayToForm(noClassDay));     // Restaura datos originales
  }, [noClassDay]);

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * Memoizada para evitar recreación innecesaria,
   * depende de errors para limpiar errores de campos editados.
   * 
   * @callback
   * @param {Event} e - Evento change del input
   */
  const onChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      
      // Actualiza el campo en el formulario
      setForm((prev) => ({ ...prev, [name]: value }));
      
      // Si había error en este campo, lo limpia
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors] // Se recrea si errors cambia
  );

  /**
   * Valida y guarda los cambios en el backend.
   * 
   * Proceso completo:
   * 1. Valida campos según esquema
   * 2. Si hay errores, los muestra y retorna false
   * 3. Construye payload con datos transformados
   * 4. Envía PUT al backend
   * 5. Si exitoso: muestra alerta, desactiva edición, recarga datos
   * 6. Si falla: muestra alerta de error
   * 
   * @async
   * @callback
   * @returns {Promise<boolean>} true si guardó exitosamente, false si falló
   */
  const save = useCallback(async () => {
    // Valida el formulario
    const result = validarCamposReact(form, baseSchema);
    
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      /**
       * Construye payload transformando valores.
       * 
       * - IDs: convierte strings a números
       * - observations: trim y null si vacío
       */
      const payload = {
        ficha_id: Number(form.ficha_id),
        reason_id: Number(form.reason_id),
        date: form.date,
        observations: form.observations?.trim() || null,
      };

      // Envía PUT al endpoint específico
      const res = await api.put(`no_class_days/${noClassDayId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el día sin clase.");
        return false;
      }

      // Éxito: muestra alerta
      await success(res.message || "Día sin clase actualizado con éxito.");
      
      // Desactiva modo edición
      setIsEditing(false);
      
      // Recarga datos actualizados del backend
      await fetchNoClassDay();
      
      return true;
      
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
      
    } finally {
      setSaving(false);
    }
  }, [form, noClassDayId, fetchNoClassDay]); // Dependencias necesarias

  /**
   * Elimina el día sin clase después de confirmación.
   * 
   * Proceso:
   * 1. Muestra diálogo de confirmación
   * 2. Si usuario confirma, envía DELETE
   * 3. Si exitoso: muestra alerta y redirige a lista
   * 4. Si falla: muestra alerta de error
   * 
   * @async
   * @callback
   * @returns {Promise<boolean>} true si eliminó, false si canceló o falló
   */
  const deleteNoClassDay = useCallback(async () => {
    // Muestra diálogo de confirmación
    const confirmed = await confirm(
      "¿Eliminar este día sin clase permanentemente?"
    );
    
    // Si usuario canceló, retorna false
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      // Envía DELETE al backend
      const res = await api.delete(`no_class_days/${noClassDayId}`);
      
      if (!res.ok) {
        await error(res.message || "No se pudo eliminar.");
        return false;
      }

      // Éxito: muestra alerta
      await success("Día sin clase eliminado!");
      
      // Redirige a la lista de días sin clase
      navigate("/no_class_days");
      
      return true;
      
    } catch (e) {
      await error(e?.message || "Error al eliminar.");
      return false;
      
    } finally {
      setSaving(false);
    }
  }, [noClassDayId, navigate]);

  // Retorna todos los estados y funciones
  return {
    noClassDay,           // Datos del registro
    loading,              // Carga inicial
    
    isEditing,            // Modo edición activo
    form,                 // Estado del formulario
    errors,               // Errores de validación
    saving,               // Guardando/eliminando
    
    startEdit,            // Activar edición
    cancelEdit,           // Cancelar edición
    onChange,             // Handler de cambios
    save,                 // Guardar cambios
    deleteNoClassDay,     // Eliminar registro
    
    refetch: fetchNoClassDay,  // Recargar datos
  };
}