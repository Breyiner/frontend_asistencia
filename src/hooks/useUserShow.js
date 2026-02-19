// Importa hooks de React
import { useEffect, useState, useCallback } from "react";

// Importa cliente de API
import { api } from "../services/apiClient";

// Importa función de validación
import { validarCamposReact } from "../utils/validators";

// Importa utilidades de alertas
import { success, error, confirm } from "../utils/alertas";

// Importa hook de navegación
import { useNavigate } from "react-router-dom";

/**
 * Esquema de validación para actualizar usuario.
 * 
 * Campos obligatorios:
 * - first_name, last_name: nombres y apellidos
 * - email: correo electrónico
 * - telephone_number: teléfono
 * - document_type_id: tipo de documento (CC, TI, CE, etc.)
 * - document_number: número de documento
 * - status_id: estado del usuario (activo, inactivo, etc.)
 * 
 * Nota: roles y areas se validan por separado en la función save.
 * 
 * @constant
 */
const userUpdateSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", minLength: 7, maxLength: 20 },
  { name: "document_type_id", type: "select", required: true },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "status_id", type: "select", required: true },
];

/**
 * Mapea un objeto de usuario al formato del formulario.
 * 
 * Características especiales:
 * - Maneja arrays de IDs de roles y áreas
 * - Genera strings de visualización (rolesDisplay, areasDisplay)
 * - Busca labels de las opciones para mostrar nombres legibles
 * 
 * @function
 * @param {Object|null} user - Objeto de usuario del backend
 * @param {Array} rolesOptions - Opciones de roles para buscar labels
 * @param {Array} areasOptions - Opciones de áreas para buscar labels
 * @returns {Object} Objeto con valores del formulario
 */
function mapUserToForm(user, rolesOptions = [], areasOptions = []) {
  // Extrae arrays de IDs o usa arrays vacíos
  const rolesIds = Array.isArray(user?.role_ids) ? user.role_ids : [];
  const areaIds = Array.isArray(user?.area_ids) ? user.area_ids : [];

  return {
    // Campos básicos
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    telephone_number: user?.telephone_number || "",
    document_type_id: user?.document_type_id ? String(user.document_type_id) : "",
    document_number: user?.document_number || "",
    status_id: user?.status_id ? String(user.status_id) : "",

    // Arrays de IDs como strings para selects múltiples
    roles: rolesIds.map(String),
    areas: areaIds.map(String),

    /**
     * String de visualización de roles.
     * Intenta tres métodos en orden de preferencia:
     * 1. Si hay rolesIds y rolesOptions: busca labels
     * 2. Si user.roles es array: une los nombres
     * 3. Si user.roles es string: usa directamente
     */
    rolesDisplay: rolesIds.length
      ? rolesIds
          .map((id) => rolesOptions.find((opt) => opt.value == id)?.label || `Rol ${id}`)
          .filter(Boolean)
          .join(", ")
      : Array.isArray(user?.roles)
      ? user.roles.join(", ")
      : user?.roles || "",

    /**
     * String de visualización de áreas.
     * Mismo patrón que rolesDisplay.
     */
    areasDisplay: areaIds.length
      ? areaIds
          .map((id) => areasOptions.find((opt) => opt.value == id)?.label || `Área ${id}`)
          .filter(Boolean)
          .join(", ")
      : Array.isArray(user?.areas)
      ? user.areas.join(", ")
      : user?.areas || "",
  };
}

/**
 * Hook personalizado para mostrar y editar un usuario.
 * 
 * Gestiona:
 * - Carga de datos del usuario
 * - Catálogos de roles y áreas (inyectados externamente)
 * - Edición de información del usuario
 * - Validación compleja (campos + roles + áreas)
 * - Eliminación del usuario
 * 
 * Características especiales:
 * - Requiere inyección de catálogos mediante setRolesCatalog y setAreasCatalog
 * - Maneja selects múltiples (roles y áreas)
 * - Validación personalizada para roles y áreas
 * 
 * @hook
 * @param {string|number} id - ID del usuario a mostrar/editar
 * @returns {Object} Estados y funciones para gestionar el usuario
 */
export default function useUserShow(id) {
  
  // Hook de navegación
  const navigate = useNavigate();
  
  // Estado del usuario
  const [user, setUser] = useState(null);
  
  // Estado de carga
  const [loading, setLoading] = useState(false);
  
  // Catálogos de opciones (inyectados desde el componente)
  const [rolesOptions, setRolesOptions] = useState([]);
  const [areasOptions, setAreasOptions] = useState([]);

  // Estado de modo edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado del formulario
  const [form, setForm] = useState(mapUserToForm(null, [], []));
  
  // Estado de errores
  const [errors, setErrors] = useState({});
  
  // Estado de guardado
  const [saving, setSaving] = useState(false);

  /**
   * Carga el usuario del backend.
   * 
   * @async
   */
  const fetchUser = async () => {
    if (!id) return;
    
    setLoading(true);
    
    try {
      const res = await api.get(`users/${id}`);
      setUser(res.ok ? res.data : null);
      if (!res.ok) setIsEditing(false);
      
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efecto para cargar usuario al montar o cuando cambia id.
   */
  useEffect(() => {
    fetchUser();
  }, [id]);

  /**
   * Efecto para sincronizar formulario con datos del usuario.
   * Solo actualiza si NO está editando.
   * Depende también de rolesOptions y areasOptions para generar displays.
   */
  useEffect(() => {
    if (!user) return;
    if (!isEditing) setForm(mapUserToForm(user, rolesOptions, areasOptions));
  }, [user, isEditing, rolesOptions, areasOptions]);

  /**
   * Función para inyectar el catálogo de roles desde el componente.
   * Permite que el componente obtenga roles de donde necesite.
   * 
   * @param {Array} options - Array de opciones de roles
   */
  const setRolesCatalog = (options) => {
    setRolesOptions(options || []);
  };

  /**
   * Función para inyectar el catálogo de áreas desde el componente.
   * 
   * @param {Array} options - Array de opciones de áreas
   */
  const setAreasCatalog = (options) => {
    setAreasOptions(options || []);
  };

  /**
   * Activa el modo de edición.
   * Inicializa formulario con datos actuales y catálogos.
   * 
   * @callback
   */
  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapUserToForm(user, rolesOptions, areasOptions));
  }, [user, rolesOptions, areasOptions]);

  /**
   * Cancela la edición.
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapUserToForm(user, rolesOptions, areasOptions));
  };

  /**
   * Maneja cambios en campos del formulario.
   * 
   * Manejo especial para selects múltiples:
   * - Si multiple es true, extrae todos los valores seleccionados
   * - Si no, usa el valor simple
   * 
   * @param {Event} e - Evento change del input
   */
  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;
    
    // Si es select múltiple, extrae array de valores
    // Si no, usa valor simple
    const nextValue = multiple ? Array.from(selectedOptions).map((opt) => opt.value) : value;
    
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Guarda los cambios del usuario.
   * 
   * Validación en dos niveles:
   * 1. Validación de esquema (campos básicos)
   * 2. Validación personalizada (roles y áreas no vacíos)
   * 
   * @async
   * @returns {Promise<boolean>} true si guardó exitosamente
   */
  const save = async () => {
    // Nivel 1: Validación de esquema
    const result = validarCamposReact(form, userUpdateSchema);

    // Nivel 2: Validación personalizada para roles y áreas
    const extraErrors = {};
    
    // Verifica que haya al menos un rol seleccionado
    if (!form.roles || form.roles.length === 0) {
      extraErrors.roles = "Selecciona al menos un rol.";
    }
    
    // Verifica que haya al menos un área seleccionada
    if (!form.areas || form.areas.length === 0) {
      extraErrors.areas = "Selecciona al menos un área.";
    }

    // Combina errores de validación de esquema y personalizados
    const mergedErrors = { ...(result?.errors || {}), ...extraErrors };
    setErrors(mergedErrors);
    
    // Si hay errores de cualquier tipo, no continúa
    if (!result.ok || Object.keys(extraErrors).length > 0) return false;

    try {
      setSaving(true);
      
      // Construye payload con todos los campos
      const payload = {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim(),
        telephone_number: form.telephone_number?.trim(),
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number: form.document_number?.trim(),
        status_id: form.status_id ? Number(form.status_id) : null,
        // Arrays de IDs convertidos a números
        roles: (form.roles || []).map(Number),
        area_ids: (form.areas || []).map(Number),
      };

      const res = await api.patch(`users/${id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el usuario.");
        return false;
      }
      
      await success(res.message || "Usuario actualizado con éxito.");
      setIsEditing(false);
      await fetchUser(); // Recarga datos
      return true;
      
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
      
    } finally {
      setSaving(false);
    }
  };

  /**
   * Elimina el usuario después de confirmación.
   * 
   * @async
   * @returns {Promise<boolean>} true si eliminó
   */
  const deleteUser = async () => {
    const confirmed = await confirm("¿Eliminar este usuario permanentemente?");
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);
      
      const res = await api.delete(`users/${id}`);
      
      if (!res.ok) {
        await error(res.message || "No se pudo eliminar");
        return false;
      }

      await success("Usuario eliminado!");
      navigate("/users"); // Redirige a lista
      return true;
      
    } catch (e) {
      await error(e.message || "Error al eliminar");
      return false;
      
    } finally {
      setSaving(false);
    }
  };

  // Retorna estados y funciones
  return {
    user,                      // Datos del usuario
    loading,                   // Carga inicial
    isEditing,                 // Modo edición
    form,                      // Estado del formulario
    errors,                    // Errores de validación
    saving,                    // Guardando/eliminando
    rolesDisplay: form.rolesDisplay,  // String de roles para visualización
    areasDisplay: form.areasDisplay,  // String de áreas para visualización
    startEdit,                 // Activar edición
    cancelEdit,                // Cancelar edición
    onChange,                  // Handler de cambios
    save,                      // Guardar cambios
    setRolesCatalog,           // Inyectar catálogo de roles
    setAreasCatalog,           // Inyectar catálogo de áreas
    refetch: fetchUser,        // Recargar datos
    deleteUser,                // Eliminar usuario
  };
}