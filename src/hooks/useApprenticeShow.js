import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

/**
 * Schema de validación para actualización de aprendices.
 * 
 * Similar al de creación, pero sin training_program_id ni ficha_id
 * (esos no se editan directamente desde el perfil).
 * 
 * Incluye:
 * - status_id: estado del aprendiz (Activo, Inactivo, etc.)
 * - roles: se valida manualmente en el hook
 * 
 * @constant
 * @type {Array<Object>}
 */
const apprenticeUpdateSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", minLength: 7, maxLength: 20 },

  { name: "birth_date", type: "text", pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "Fecha inválida (YYYY-MM-DD)" },

  { name: "document_type_id", type: "select", required: true },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "status_id", type: "select", required: true },
];

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD.
 * 
 * @function
 * @returns {string} Fecha actual
 */
function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Mapea los datos del aprendiz a formato de formulario.
 * 
 * Características:
 * - Maneja estructuras de datos anidadas (profile.birth_date)
 * - Convierte IDs a strings (para selects)
 * - Convierte array de role_ids a array de strings
 * - Genera rolesDisplay: string legible con nombres de roles
 * 
 * @function
 * @param {Object|null} apprentice - Objeto aprendiz desde la API
 * @param {Array<Object>} [rolesOptions=[]] - Catálogo de roles disponibles
 * @returns {Object} Objeto con valores para el formulario
 * 
 * @example
 * const formData = mapApprenticeToForm(
 *   {
 *     id: 1,
 *     first_name: "Juan",
 *     role_ids: [2, 5]
 *   },
 *   [
 *     { value: "2", label: "Estudiante" },
 *     { value: "5", label: "Líder" }
 *   ]
 * );
 * // formData.rolesDisplay = "Estudiante, Líder"
 */
function mapApprenticeToForm(apprentice, rolesOptions = []) {
  return {
    first_name: apprentice?.first_name || "",
    last_name: apprentice?.last_name || "",
    email: apprentice?.email || "",
    telephone_number: apprentice?.telephone_number || "",

    // Soporta birth_date directo o anidado en profile
    birth_date: apprentice?.birth_date || apprentice?.profile?.birth_date || "",

    document_type_id: apprentice?.document_type_id ? String(apprentice.document_type_id) : "",
    document_number: apprentice?.document_number || "",
    status_id: apprentice?.status_id ? String(apprentice.status_id) : "",
    
    // Convierte array de números a array de strings para selects múltiples
    roles: Array.isArray(apprentice?.role_ids) ? apprentice.role_ids.map(String) : [],

    // rolesDisplay: string legible para mostrar en modo vista
    // Busca cada ID en rolesOptions y toma el label, luego los une con comas
    rolesDisplay: Array.isArray(apprentice?.role_ids)
      ? apprentice.role_ids
          .map((id) => rolesOptions.find((opt) => opt.value == id)?.label || `Rol ${id}`)
          .filter(Boolean)
          .join(", ")
      : apprentice?.roles || "", // Fallback si viene como string
  };
}

/**
 * Hook personalizado para ver y editar un aprendiz específico.
 * 
 * Maneja dos modos:
 * 1. **Modo vista**: muestra información del aprendiz
 * 2. **Modo edición**: permite modificar datos
 * 
 * Características:
 * - Carga automática de datos al montar
 * - Toggle entre modo vista y edición
 * - Validación completa antes de guardar
 * - Validación de roles (al menos uno requerido)
 * - Cancelación con restauración de datos originales
 * - Eliminación con confirmación
 * - Navegación automática después de eliminar
 * - Recarga de datos después de guardar
 * - Soporte para catálogo de roles externo
 * 
 * @hook
 * 
 * @param {number|string} id - ID del aprendiz a cargar
 * 
 * @returns {Object} Objeto con estado y funciones
 * @returns {Object|null} return.apprentice - Datos del aprendiz desde la API
 * @returns {boolean} return.loading - Si está cargando datos iniciales
 * @returns {boolean} return.isEditing - Si está en modo edición
 * @returns {Object} return.form - Valores del formulario
 * @returns {Object} return.errors - Errores de validación por campo
 * @returns {boolean} return.saving - Si está guardando o eliminando
 * @returns {string} return.rolesDisplay - String legible con nombres de roles
 * @returns {Function} return.startEdit - Activa modo edición
 * @returns {Function} return.cancelEdit - Cancela edición y restaura datos
 * @returns {Function} return.onChange - Handler para cambios en inputs
 * @returns {Function} return.save - Guarda cambios en el servidor
 * @returns {Function} return.setRolesCatalog - Establece catálogo de roles
 * @returns {Function} return.refetch - Recarga datos del aprendiz
 * @returns {Function} return.deleteApprentice - Elimina el aprendiz
 * 
 * @example
 * function ApprenticeShowPage() {
 *   const { id } = useParams();
 *   const {
 *     apprentice,
 *     loading,
 *     isEditing,
 *     form,
 *     errors,
 *     saving,
 *     startEdit,
 *     cancelEdit,
 *     onChange,
 *     save,
 *     deleteApprentice
 *   } = useApprenticeShow(id);
 * 
 *   if (loading) return <Spinner />;
 *   if (!apprentice) return <NotFound />;
 * 
 *   return (
 *     <div>
 *       {!isEditing ? (
 *         <>
 *           <p>{apprentice.first_name}</p>
 *           <button onClick={startEdit}>Editar</button>
 *         </>
 *       ) : (
 *         <>
 *           <InputField name="first_name" value={form.first_name} onChange={onChange} />
 *           <button onClick={save}>Guardar</button>
 *           <button onClick={cancelEdit}>Cancelar</button>
 *         </>
 *       )}
 *     </div>
 *   );
 * }
 */
export default function useApprenticeShow(id) {
  const navigate = useNavigate();
  
  // Datos originales del aprendiz desde la API
  const [apprentice, setApprentice] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Catálogo de roles para mapear IDs a nombres
  const [rolesOptions, setRolesOptions] = useState([]);

  // Estado de edición
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapApprenticeToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /**
   * Carga los datos del aprendiz desde la API.
   * 
   * - Si no hay ID, no hace nada
   * - Si falla, deshabilita modo edición
   * - Actualiza el estado con los datos obtenidos
   */
  const fetchApprentice = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`apprentices/${id}`);
      setApprentice(res.ok ? res.data : null);
      if (!res.ok) setIsEditing(false);
    } finally {
      setLoading(false);
    }
  };

  // Carga datos al montar o cuando cambia el ID
  useEffect(() => {
    fetchApprentice();
  }, [id]);

  /**
   * Sincroniza el formulario con los datos del aprendiz.
   * 
   * - Solo se ejecuta cuando NO está editando
   * - Actualiza el formulario cuando cambian los datos o el catálogo de roles
   * - Esto permite que el rolesDisplay se actualice correctamente
   */
  useEffect(() => {
    if (!apprentice) return;
    if (!isEditing) setForm(mapApprenticeToForm(apprentice, rolesOptions));
  }, [apprentice, isEditing, rolesOptions]);

  /**
   * Establece el catálogo de roles disponibles.
   * 
   * Usado por el componente padre para inyectar las opciones de roles.
   * 
   * @param {Array<Object>} options - Array de objetos {value, label}
   */
  const setRolesCatalog = (options) => {
    setRolesOptions(options || []);
  };

  /**
   * Activa el modo edición.
   * 
   * - Limpia errores previos
   * - Restablece el formulario con datos actuales
   * - useCallback previene recreación en cada render
   */
  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapApprenticeToForm(apprentice, rolesOptions));
  }, [apprentice, rolesOptions]);

  /**
   * Cancela la edición y restaura datos originales.
   * 
   * - Sale del modo edición
   * - Limpia errores
   * - Restaura valores originales del formulario
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapApprenticeToForm(apprentice, rolesOptions));
  };

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * - Soporta selects múltiples
   * - Limpia errores del campo modificado
   */
  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;
    const nextValue = multiple ? Array.from(selectedOptions).map((opt) => opt.value) : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Valida y guarda los cambios en el servidor.
   * 
   * Proceso:
   * 1. Validación con schema
   * 2. Validación extra: al menos un rol seleccionado
   * 3. Validación extra: fecha de nacimiento < hoy
   * 4. Si hay errores, los muestra y detiene
   * 5. Envía PATCH a la API
   * 6. Sale de modo edición
   * 7. Recarga datos actualizados
   * 8. Muestra alerta de éxito
   * 
   * @async
   * @returns {Promise<boolean>} true si guardó correctamente, false si falló
   */
  const save = async () => {
    // Paso 1: Validación con schema
    const result = validarCamposReact(form, apprenticeUpdateSchema);

    // Paso 2: Validaciones extra
    const extraErrors = {};

    // Validación: al menos un rol debe estar seleccionado
    if (!form.roles || form.roles.length === 0) {
      extraErrors.roles = "Selecciona al menos un rol.";
    }

    // Validación: fecha de nacimiento debe ser anterior a hoy
    const today = todayYmd();
    if (form.birth_date && form.birth_date >= today) {
      extraErrors.birth_date = "La fecha de nacimiento debe ser anterior a hoy.";
    }

    // Combina todos los errores
    const mergedErrors = { ...(result?.errors || {}), ...extraErrors };
    setErrors(mergedErrors);

    // Si hay errores, detiene el proceso
    if (!result.ok || Object.keys(extraErrors).length > 0) return false;

    try {
      setSaving(true);

      // Construye el payload
      const payload = {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim(),
        telephone_number: form.telephone_number?.trim(),
        birth_date: form.birth_date,
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number: form.document_number?.trim(),
        status_id: form.status_id ? Number(form.status_id) : null,
        // Convierte array de strings a array de números
        roles: (form.roles || []).map(Number),
      };

      // Envía PATCH (actualización parcial)
      const res = await api.patch(`apprentices/${id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el aprendiz.");
        return false;
      }

      await success(res.message || "Aprendiz actualizado con éxito.");
      setIsEditing(false);
      // Recarga los datos para reflejar cambios
      await fetchApprentice();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  /**
   * Elimina el aprendiz con confirmación.
   * 
   * Proceso:
   * 1. Muestra diálogo de confirmación
   * 2. Si cancela, retorna false
   * 3. Envía DELETE a la API
   * 4. Si éxito, muestra alerta y navega a lista
   * 5. Si falla, muestra error
   * 
   * @async
   * @returns {Promise<boolean>} true si eliminó correctamente, false si falló o canceló
   */
  const deleteApprentice = async () => {
    // Paso 1: Confirmación del usuario
    const confirmed = await confirm("¿Eliminar este aprendiz permanentemente?");
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);
      const res = await api.delete(`apprentices/${id}`);

      if (!res.ok) {
        await error(res.message || "No se pudo eliminar");
        return false;
      }

      await success("Aprendiz eliminado!");
      // Navega a la lista de aprendices después de eliminar
      navigate("/apprentices");
      return true;
    } catch (e) {
      await error(e?.message || "Error al eliminar");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    apprentice,
    loading,
    isEditing,
    form,
    errors,
    saving,
    rolesDisplay: form.rolesDisplay,
    startEdit,
    cancelEdit,
    onChange,
    save,
    setRolesCatalog,
    refetch: fetchApprentice,
    deleteApprentice,
  };
}
