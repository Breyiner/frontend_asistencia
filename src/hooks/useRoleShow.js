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
 * Esquema de validación para actualizar rol.
 * 
 * - name: texto obligatorio, máximo 50 caracteres
 * - description: texto opcional, mínimo 3 caracteres, máximo 255
 * 
 * @constant
 */
const roleUpdateSchema = [
  { name: "name", type: "text", required: true, maxLength: 50 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

/**
 * Mapea un objeto de rol al formato del formulario.
 * 
 * @function
 * @param {Object|null} role - Objeto de rol del backend
 * @returns {Object} Objeto con valores del formulario
 */
function mapRoleToForm(role) {
  return {
    // Nombre del rol
    name: role?.name || "",
    // Descripción del rol
    description: role?.description || "",
  };
}

/**
 * Hook personalizado para mostrar y editar un rol.
 * 
 * Gestiona:
 * - Carga de datos del rol
 * - Carga del catálogo de permisos disponibles
 * - Edición de información básica (nombre, descripción)
 * - Sincronización de permisos del rol
 * - Eliminación del rol
 * 
 * Característica especial:
 * Incluye funcionalidad de sincronización de permisos mediante
 * el método syncPermissions, que permite vincular/desvincular
 * permisos del rol.
 * 
 * @hook
 * @param {string|number} roleId - ID del rol a mostrar/editar
 * @returns {Object} Estados y funciones para gestionar el rol
 */
export default function useRoleShow(roleId) {
  
  // Hook de navegación
  const navigate = useNavigate();

  // Estado del rol
  const [role, setRole] = useState(null);
  
  // Estado de carga (inicia en true, diferente a otros hooks)
  const [loading, setLoading] = useState(true);
  
  // Estado de "no encontrado" (para manejar 404)
  const [notFound, setNotFound] = useState(false);

  // Estado de modo edición
  const [isEditing, setIsEditing] = useState(false);
  
  // Estado del formulario
  const [form, setForm] = useState(mapRoleToForm(null));
  
  // Estado de errores
  const [errors, setErrors] = useState({});
  
  // Estado de guardado
  const [saving, setSaving] = useState(false);

  // Estado del catálogo completo de permisos disponibles
  // Usado para mostrar opciones en el modal de permisos
  const [allPermissions, setAllPermissions] = useState([]);

  /**
   * Carga el rol del backend.
   * 
   * Memoizada para uso como dependencia de useEffect.
   * Maneja casos especiales:
   * - Si no hay roleId: limpia estados
   * - Si la respuesta falla: establece notFound
   * 
   * @async
   * @callback
   */
  const fetchRole = useCallback(async () => {
    // Si no hay roleId, limpia estados y sale
    if (!roleId) {
      setLoading(false);
      setNotFound(false);
      setRole(null);
      return;
    }

    // Activa carga y limpia notFound
    setLoading(true);
    setNotFound(false);

    try {
      // Obtiene el rol del backend
      const res = await api.get(`roles/${roleId}`);

      // Si la respuesta no es exitosa
      if (!res.ok) {
        setRole(null);
        setNotFound(true); // Marca como no encontrado
        setIsEditing(false); // Desactiva edición
        return;
      }

      // Guarda el rol
      setRole(res.data);
      
    } catch {
      // En caso de error de red, no marca como notFound
      // Solo limpia el rol y desactiva edición
      setRole(null);
      setNotFound(false);
      setIsEditing(false);
      
    } finally {
      // Siempre desactiva loading
      setLoading(false);
    }
  }, [roleId]);

  /**
   * Carga el catálogo de permisos disponibles.
   * 
   * Obtiene la lista completa de permisos del sistema desde
   * el endpoint de roles (que incluye un summary con permisos).
   * 
   * Nota: El comentario sugiere que podría usarse /permissions/select
   * si estuviera disponible en el backend.
   * 
   * @async
   * @callback
   */
  const fetchPermissionsCatalog = useCallback(async () => {
    try {
      // Hace una petición mínima a roles para obtener el summary
      // per_page=1 minimiza datos transferidos, solo necesitamos el summary
      const res = await api.get("roles?per_page=1");
      
      if (!res.ok) return;
      
      // Extrae permisos del summary de la respuesta
      setAllPermissions(res.summary?.permissions || []);
      
    } catch {
      // Silencioso: si falla, allPermissions queda vacío
      // No es crítico para la funcionalidad básica
    }
  }, []);

  /**
   * Efecto para cargar el rol al montar o cuando cambia roleId.
   */
  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  /**
   * Efecto para cargar el catálogo de permisos al montar.
   * Solo se ejecuta una vez porque fetchPermissionsCatalog está memoizado.
   */
  useEffect(() => {
    fetchPermissionsCatalog();
  }, [fetchPermissionsCatalog]);

  /**
   * Efecto para sincronizar formulario con datos del rol.
   * Solo actualiza si NO está en modo edición.
   */
  useEffect(() => {
    if (!role) return;
    if (!isEditing) setForm(mapRoleToForm(role));
  }, [role, isEditing]);

  /**
   * Activa el modo de edición.
   * Inicializa el formulario con datos actuales del rol.
   * 
   * @callback
   */
  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapRoleToForm(role));
  }, [role]);

  /**
   * Cancela la edición y restaura el formulario.
   */
  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapRoleToForm(role));
  };

  /**
   * Maneja cambios en los campos del formulario.
   * 
   * @param {Event} e - Evento change del input
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  /**
   * Guarda los cambios de información básica del rol (nombre, descripción).
   * 
   * @async
   * @returns {Promise<boolean>} true si guardó exitosamente
   */
  const save = async () => {
    // Valida formulario
    const result = validarCamposReact(form, roleUpdateSchema);
    
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      // Construye payload con valores limpios
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
      };

      // Envía PATCH al backend
      const res = await api.patch(`roles/${roleId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el rol.");
        return false;
      }

      await success(res.message || "Rol actualizado con éxito.");
      setIsEditing(false);
      await fetchRole(); // Recarga datos
      return true;
      
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
      
    } finally {
      setSaving(false);
    }
  };

  /**
   * Elimina el rol después de confirmación.
   * 
   * @async
   * @returns {Promise<boolean>} true si eliminó, false si canceló o falló
   */
  const deleteRole = async () => {
    const confirmed = await confirm("¿Eliminar este rol permanentemente?");
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      const res = await api.delete(`roles/${roleId}`);

      if (!res.ok) {
        await error(res.message || "No se pudo eliminar");
        return false;
      }

      await success("Rol eliminado!");
      navigate("/roles"); // Redirige a lista
      return true;
      
    } catch (e) {
      await error(e?.message || "Error al eliminar");
      return false;
      
    } finally {
      setSaving(false);
    }
  };

  /**
   * Sincroniza los permisos del rol.
   * 
   * Permite actualizar qué permisos tiene asignados el rol.
   * Este método es usado típicamente desde un modal de selección
   * de permisos (PermissionsModal).
   * 
   * @async
   * @param {Array<number>} permissionIds - Array de IDs de permisos a asignar
   * @returns {Promise<boolean>} true si sincronizó exitosamente
   */
  const syncPermissions = async (permissionIds) => {
    try {
      setSaving(true);

      // Envía PATCH al endpoint de sincronización
      const res = await api.patch(`roles/${roleId}/sync_permissions`, {
        permission_ids: permissionIds,
      });

      if (!res.ok) {
        await error(res.message || "No se pudieron actualizar los permisos.");
        return false;
      }

      await success(res.message || "Permisos actualizados con éxito.");
      await fetchRole(); // Recarga datos para reflejar cambios
      return true;
      
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
      
    } finally {
      setSaving(false);
    }
  };

  // Retorna estados y funciones
  return {
    role,                  // Datos del rol
    loading,               // Carga inicial
    notFound,              // Bandera de no encontrado

    isEditing,             // Modo edición
    form,                  // Estado del formulario
    errors,                // Errores de validación
    saving,                // Guardando/eliminando

    startEdit,             // Activar edición
    cancelEdit,            // Cancelar edición
    onChange,              // Handler de cambios
    save,                  // Guardar información básica
    deleteRole,            // Eliminar rol

    allPermissions,        // Catálogo de permisos disponibles
    syncPermissions,       // Sincronizar permisos del rol

    refetch: fetchRole,    // Recargar datos
  };
}