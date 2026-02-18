import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

/**
 * Schema de validación para actualización de ambientes.
 * 
 * Idéntico al schema de creación.
 * 
 * @constant
 * @type {Array<Object>}
 */
const classroomUpdateSchema = [
  { name: "name", type: "text", required: true, maxLength: 80 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

/**
 * Mapea los datos del ambiente a formato de formulario.
 * 
 * Convierte valores null/undefined a strings vacíos
 * para prevenir errores en inputs controlados.
 * 
 * @function
 * @param {Object|null} classroom - Objeto ambiente desde la API
 * @returns {Object} Objeto con valores para el formulario
 * 
 * @example
 * const formData = mapClassroomToForm({
 *   name: "Aula 101",
 *   description: "Ambiente para clases prácticas"
 * });
 * // { name: "Aula 101", description: "Ambiente para clases prácticas" }
 * 
 * @example
 * const formData = mapClassroomToForm(null);
 * // { name: "", description: "" }
 */
function mapClassroomToForm(classroom) {
  return {
    name: classroom?.name || "",
    description: classroom?.description || "",
  };
}

/**
 * Hook personalizado para ver y editar un ambiente específico.
 * 
 * Maneja dos modos:
 * 1. **Modo vista**: muestra información del ambiente
 * 2. **Modo edición**: permite modificar datos
 * 
 * Características especiales:
 * - Manejo robusto de estados de carga
 * - Detección de ambiente no encontrado (404)
 * - Diferencia entre "no encontrado" y "error de conexión"
 * - Toggle entre modo vista y edición
 * - Cancelación con restauración de datos
 * - Eliminación con confirmación
 * - Navegación automática después de eliminar
 * - Validación consistente con creación
 * 
 * @hook
 * 
 * @param {number|string} id - ID del ambiente a cargar
 * 
 * @returns {Object} Objeto con estado y funciones
 * @returns {Object|null} return.classroom - Datos del ambiente desde la API
 * @returns {boolean} return.loading - Si está cargando datos iniciales
 * @returns {boolean} return.notFound - Si el ambiente no existe (404)
 * @returns {boolean} return.isEditing - Si está en modo edición
 * @returns {Object} return.form - Valores del formulario
 * @returns {Object} return.errors - Errores de validación
 * @returns {boolean} return.saving - Si está guardando o eliminando
 * @returns {Function} return.startEdit - Activa modo edición
 * @returns {Function} return.cancelEdit - Cancela edición
 * @returns {Function} return.onChange - Handler para cambios
 * @returns {Function} return.save - Guarda cambios
 * @returns {Function} return.deleteClassroom - Elimina el ambiente
 * @returns {Function} return.refetch - Recarga datos del ambiente
 * 
 * @example
 * function ClassroomShowPage() {
 *   const { id } = useParams();
 *   const {
 *     classroom,
 *     loading,
 *     notFound,
 *     isEditing,
 *     form,
 *     errors,
 *     startEdit,
 *     cancelEdit,
 *     onChange,
 *     save,
 *     deleteClassroom
 *   } = useClassroomShow(id);
 * 
 *   if (loading) return <Spinner />;
 *   if (notFound) return <NotFound message="Ambiente no encontrado" />;
 *   if (!classroom) return <ErrorMessage message="Error al cargar" />;
 * 
 *   return (
 *     <div>
 *       {!isEditing ? (
 *         <>
 *           <h1>{classroom.name}</h1>
 *           <p>{classroom.description}</p>
 *           <button onClick={startEdit}>Editar</button>
 *           <button onClick={deleteClassroom}>Eliminar</button>
 *         </>
 *       ) : (
 *         <>
 *           <InputField name="name" value={form.name} onChange={onChange} error={errors.name} />
 *           <button onClick={save}>Guardar</button>
 *           <button onClick={cancelEdit}>Cancelar</button>
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 */
export default function useClassroomShow(id) {
  const navigate = useNavigate();

  // Datos originales del ambiente
  const [classroom, setClassroom] = useState(null);
  
  // loading arranca en true (importante para mostrar spinner inmediatamente)
  const [loading, setLoading] = useState(true);
  
  // notFound indica específicamente que el ambiente no existe (404)
  // Diferente de un error de conexión
  const [notFound, setNotFound] = useState(false);

  // Estado de edición
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapClassroomToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /**
   * Carga los datos del ambiente desde la API.
   * 
   * Lógica de estados:
   * - Si no hay ID: loading=false, notFound=false, classroom=null
   *   (puede pasar si el parámetro de ruta tiene un nombre diferente)
   * - Si la API retorna !ok: notFound=true (ambiente no existe)
   * - Si hay error de conexión: notFound=false (no sabemos si existe)
   * 
   * useCallback con dependencia [id] previene recreación innecesaria
   * pero se actualiza cuando cambia el ID.
   */
  const fetchClassroom = useCallback(async () => {
    // Caso especial: si no hay ID, no marca "No encontrado"
    // (puede ser que el componente esté montado pero sin params aún)
    if (!id) {
      setLoading(false);
      setNotFound(false);
      setClassroom(null);
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const res = await api.get(`classrooms/${id}`);

      if (!res.ok) {
        // La API retornó un error (probablemente 404)
        setClassroom(null);
        setNotFound(true); // Marca como "no encontrado"
        setIsEditing(false); // Deshabilita modo edición
        return;
      }

      // Éxito: guarda los datos
      setClassroom(res.data);
    } catch (e) {
      // Error de conexión o error inesperado
      // NO marcamos notFound porque no sabemos si el ambiente existe
      // (podría ser problema de red)
      setClassroom(null);
      setNotFound(false);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Carga datos al montar o cuando cambia fetchClassroom (cuando cambia id)
  useEffect(() => {
    fetchClassroom();
  }, [fetchClassroom]);

  /**
   * Sincroniza el formulario con los datos del ambiente.
   * 
   * Solo actualiza cuando NO está editando, para no perder
   * cambios mientras el usuario está escribiendo.
   */
  useEffect(() => {
    if (!classroom) return;
    if (!isEditing) setForm(mapClassroomToForm(classroom));
  }, [classroom, isEditing]);

  /**
   * Activa el modo edición.
   * 
   * - Limpia errores previos
   * - Restablece el formulario con datos actuales
   * - useCallback previene recreación innecesaria
   */
  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapClassroomToForm(classroom));
  }, [classroom]);

  /**
   * Cancela la edición y restaura datos originales.
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapClassroomToForm(classroom));
  };

  /**
   * Maneja cambios en los campos del formulario.
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Valida y guarda los cambios en el servidor.
   * 
   * Proceso:
   * 1. Validación con schema
   * 2. Si hay errores, los muestra y detiene
   * 3. Envía PATCH a la API
   * 4. Sale de modo edición
   * 5. Recarga datos actualizados
   * 6. Muestra alerta de éxito
   * 
   * @async
   * @returns {Promise<boolean>} true si guardó, false si falló
   */
  const save = async () => {
    // Validación
    const result = validarCamposReact(form, classroomUpdateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      // Construye el payload
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
      };

      // Envía PATCH (actualización parcial)
      const res = await api.patch(`classrooms/${id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el ambiente.");
        return false;
      }

      await success(res.message || "Ambiente actualizado con éxito.");
      setIsEditing(false);
      // Recarga los datos para reflejar cambios
      await fetchClassroom();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Elimina el ambiente con confirmación.
   * 
   * Proceso:
   * 1. Muestra diálogo de confirmación
   * 2. Si cancela, retorna false
   * 3. Envía DELETE a la API
   * 4. Si éxito, muestra alerta y navega a lista
   * 5. Si falla, muestra error
   * 
   * @async
   * @returns {Promise<boolean>} true si eliminó, false si falló o canceló
   */
  const deleteClassroom = async () => {
    const confirmed = await confirm("¿Eliminar este ambiente permanentemente?");
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      const res = await api.delete(`classrooms/${id}`);

      if (!res.ok) {
        await error(res.message || "No se pudo eliminar");
        return false;
      }

      await success("Ambiente eliminado!");
      // Navega a la lista de ambientes después de eliminar
      navigate("/classrooms");
      return true;
    } catch (e) {
      await error(e?.message || "Error al eliminar");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    classroom,
    loading,
    notFound,
    isEditing,
    form,
    errors,
    saving,
    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteClassroom,
    refetch: fetchClassroom,
  };
}
