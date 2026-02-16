import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const roleUpdateSchema = [
  { name: "name", type: "text", required: true, maxLength: 50 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

function mapRoleToForm(role) {
  return {
    name: role?.name || "",
    description: role?.description || "",
  };
}

export default function useRoleShow(roleId) {
  const navigate = useNavigate();

  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapRoleToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const [allPermissions, setAllPermissions] = useState([]);

  const fetchRole = useCallback(async () => {
    if (!roleId) {
      setLoading(false);
      setNotFound(false);
      setRole(null);
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const res = await api.get(`roles/${roleId}`);

      if (!res.ok) {
        setRole(null);
        setNotFound(true);
        setIsEditing(false);
        return;
      }

      setRole(res.data);
    } catch {
      setRole(null);
      setNotFound(false);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  }, [roleId]);

  const fetchPermissionsCatalog = useCallback(async () => {
    try {
      // si decides usar /permissions/select, cambia esta línea
      const res = await api.get("roles?per_page=1");
      if (!res.ok) return;
      setAllPermissions(res.summary?.permissions || []);
    } catch {
      // silencioso
    }
  }, []);

  useEffect(() => {
    fetchRole();
  }, [fetchRole]);

  useEffect(() => {
    fetchPermissionsCatalog();
  }, [fetchPermissionsCatalog]);

  useEffect(() => {
    if (!role) return;
    if (!isEditing) setForm(mapRoleToForm(role));
  }, [role, isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapRoleToForm(role));
  }, [role]);

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapRoleToForm(role));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const save = async () => {
    const result = validarCamposReact(form, roleUpdateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
      };

      const res = await api.patch(`roles/${roleId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el rol.");
        return false;
      }

      await success(res.message || "Rol actualizado con éxito.");
      setIsEditing(false);
      await fetchRole();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

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
      navigate("/roles");
      return true;
    } catch (e) {
      await error(e?.message || "Error al eliminar");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const syncPermissions = async (permissionIds) => {
    try {
      setSaving(true);

      const res = await api.patch(`roles/${roleId}/sync_permissions`, {
        permission_ids: permissionIds,
      });

      if (!res.ok) {
        await error(res.message || "No se pudieron actualizar los permisos.");
        return false;
      }

      await success(res.message || "Permisos actualizados con éxito.");
      await fetchRole();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    role,
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
    deleteRole,

    allPermissions,
    syncPermissions,

    refetch: fetchRole,
  };
}
