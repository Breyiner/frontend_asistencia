import { useEffect, useState, useCallback } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";
import { useNavigate } from "react-router-dom";

const areaUpdateSchema = [
  { name: "name", type: "text", required: true, maxLength: 80 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

function mapAreaToForm(area) {
  return {
    name: area?.name || "",
    description: area?.description || "",
  };
}

export default function useAreaShow(id) {
  const navigate = useNavigate();

  const [area, setArea] = useState(null);
  const [loading, setLoading] = useState(true); // importante: arranca en true
  const [notFound, setNotFound] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapAreaToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchArea = useCallback(async () => {
    // Si id es undefined por el nombre del param en la ruta, evita marcar "No encontrado"
    if (!id) {
      setLoading(false);
      setNotFound(false);
      setArea(null);
      return;
    }

    setLoading(true);
    setNotFound(false);

    try {
      const res = await api.get(`areas/${id}`);

      if (!res.ok) {
        setArea(null);
        setNotFound(true);
        setIsEditing(false);
        return;
      }

      setArea(res.data);
    } catch (e) {
      // aquí NO marcamos notFound; es error de conexión
      setArea(null);
      setNotFound(false);
      setIsEditing(false);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchArea();
  }, [fetchArea]);

  useEffect(() => {
    if (!area) return;
    if (!isEditing) setForm(mapAreaToForm(area));
  }, [area, isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
    setForm(mapAreaToForm(area));
  }, [area]);

  const cancelEdit = () => {
    setIsEditing(false);
    setErrors({});
    setForm(mapAreaToForm(area));
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const save = async () => {
    const result = validarCamposReact(form, areaUpdateSchema);
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

      const res = await api.patch(`areas/${id}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el área.");
        return false;
      }

      await success(res.message || "Área actualizada con éxito.");
      setIsEditing(false);
      await fetchArea();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const deleteArea = async () => {
    const confirmed = await confirm("¿Eliminar esta área permanentemente?");
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      const res = await api.delete(`areas/${id}`);

      if (!res.ok) {
        await error(res.message || "No se pudo eliminar");
        return false;
      }

      await success("Área eliminada!");
      navigate("/areas");
      return true;
    } catch (e) {
      await error(e?.message || "Error al eliminar");
      return false;
    } finally {
      setSaving(false);
    }
  };

  return {
    area,
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
    deleteArea,
    refetch: fetchArea,
  };
}
