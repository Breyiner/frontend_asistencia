import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const userUpdateSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 },
  { name: "document_type_id", type: "select", required: true },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "status_id", type: "select", required: true },
];

function mapUserToForm(user, rolesOptions = [], areasOptions = []) {
  const rolesIds = Array.isArray(user?.role_ids) ? user.role_ids : [];
  const areaIds = Array.isArray(user?.area_ids) ? user.area_ids : [];

  return {
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    telephone_number: user?.telephone_number || "",
    document_type_id: user?.document_type_id ? String(user.document_type_id) : "",
    document_number: user?.document_number || "",
    status_id: user?.status_id ? String(user.status_id) : "",

    roles: rolesIds.map(String),
    areas: areaIds.map(String),

    rolesDisplay: rolesIds.length
      ? rolesIds
          .map((id) => rolesOptions.find((opt) => opt.value == id)?.label || `Rol ${id}`)
          .filter(Boolean)
          .join(", ")
      : Array.isArray(user?.roles)
      ? user.roles.join(", ")
      : user?.roles || "",

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

export default function useUserShow(id) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolesOptions, setRolesOptions] = useState([]);
  const [areasOptions, setAreasOptions] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapUserToForm(null, [], []));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchUser();
  }, [id]);

  useEffect(() => {
    if (!user) return;
    if (!isEditing) setForm(mapUserToForm(user, rolesOptions, areasOptions));
  }, [user, isEditing, rolesOptions, areasOptions]);

  const setRolesCatalog = (options) => {
    setRolesOptions(options || []);
  };

  const setAreasCatalog = (options) => {
    setAreasOptions(options || []);
  };

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapUserToForm(user, rolesOptions, areasOptions));
  }, [user, rolesOptions, areasOptions]);

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapUserToForm(user, rolesOptions, areasOptions));
  };

  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;
    const nextValue = multiple ? Array.from(selectedOptions).map((opt) => opt.value) : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const save = async () => {
    const result = validarCamposReact(form, userUpdateSchema);

    const extraErrors = {};
    if (!form.roles || form.roles.length === 0) {
      extraErrors.roles = "Selecciona al menos un rol.";
    }
    if (!form.areas || form.areas.length === 0) {
      extraErrors.areas = "Selecciona al menos un área.";
    }

    const mergedErrors = { ...(result?.errors || {}), ...extraErrors };
    setErrors(mergedErrors);
    if (!result.ok || Object.keys(extraErrors).length > 0) return false;

    try {
      setSaving(true);
      const payload = {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim(),
        telephone_number: form.telephone_number?.trim(),
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number: form.document_number?.trim(),
        status_id: form.status_id ? Number(form.status_id) : null,
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
      await fetchUser();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

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
      navigate("/users");
      return true;
    } catch (e) {
      await error(e.message || "Error al eliminar");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    user,
    loading,
    isEditing,
    form,
    errors,
    saving,
    rolesDisplay: form.rolesDisplay,
    areasDisplay: form.areasDisplay,
    startEdit,
    cancelEdit,
    onChange,
    save,
    setRolesCatalog,
    setAreasCatalog,
    refetch: fetchUser,
    deleteUser,
  };
}