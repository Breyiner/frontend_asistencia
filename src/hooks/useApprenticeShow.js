import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const apprenticeUpdateSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 },

  { name: "birth_date", type: "text", required: true, pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "Fecha inválida (YYYY-MM-DD)" },

  { name: "document_type_id", type: "select", required: true },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "status_id", type: "select", required: true },
];

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

function mapApprenticeToForm(apprentice, rolesOptions = []) {
  return {
    first_name: apprentice?.first_name || "",
    last_name: apprentice?.last_name || "",
    email: apprentice?.email || "",
    telephone_number: apprentice?.telephone_number || "",

    birth_date: apprentice?.birth_date || apprentice?.profile?.birth_date || "",

    document_type_id: apprentice?.document_type_id ? String(apprentice.document_type_id) : "",
    document_number: apprentice?.document_number || "",
    status_id: apprentice?.status_id ? String(apprentice.status_id) : "",
    roles: Array.isArray(apprentice?.role_ids) ? apprentice.role_ids.map(String) : [],

    rolesDisplay: Array.isArray(apprentice?.role_ids)
      ? apprentice.role_ids
          .map((id) => rolesOptions.find((opt) => opt.value == id)?.label || `Rol ${id}`)
          .filter(Boolean)
          .join(", ")
      : apprentice?.roles || "",
  };
}

export default function useApprenticeShow(id) {
  const navigate = useNavigate();
  const [apprentice, setApprentice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rolesOptions, setRolesOptions] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapApprenticeToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    fetchApprentice();
  }, [id]);

  useEffect(() => {
    if (!apprentice) return;
    if (!isEditing) setForm(mapApprenticeToForm(apprentice, rolesOptions));
  }, [apprentice, isEditing, rolesOptions]);

  const setRolesCatalog = (options) => {
    setRolesOptions(options || []);
  };

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapApprenticeToForm(apprentice, rolesOptions));
  }, [apprentice, rolesOptions]);

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapApprenticeToForm(apprentice, rolesOptions));
  };

  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;
    const nextValue = multiple ? Array.from(selectedOptions).map((opt) => opt.value) : value;
    setForm((prev) => ({ ...prev, [name]: nextValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const save = async () => {
    const result = validarCamposReact(form, apprenticeUpdateSchema);

    const extraErrors = {};

    if (!form.roles || form.roles.length === 0) {
      extraErrors.roles = "Selecciona al menos un rol.";
    }

    const today = todayYmd();
    if (form.birth_date && form.birth_date >= today) {
      extraErrors.birth_date = "La fecha de nacimiento debe ser anterior a hoy.";
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
        birth_date: form.birth_date,
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number: form.document_number?.trim(),
        status_id: form.status_id ? Number(form.status_id) : null,
        roles: (form.roles || []).map(Number),
      };

      const res = await api.patch(`apprentices/${id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el aprendiz.");
        return false;
      }

      await success(res.message || "Aprendiz actualizado con éxito.");
      setIsEditing(false);
      await fetchApprentice();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteApprentice = async () => {
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
