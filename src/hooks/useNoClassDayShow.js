import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";

const baseSchema = [
  { name: "ficha_id", type: "select", required: true },
  { name: "reason_id", type: "select", required: true },
  { name: "date", type: "date", required: true },
  { name: "observations", type: "text", required: false, maxLength: 1000 },
];

function mapNoClassDayToForm(noClassDay) {
  return {
    ficha_id: noClassDay?.ficha_id ? String(noClassDay.ficha_id) : "",
    reason_id: noClassDay?.reason_id ? String(noClassDay.reason_id) : "",
    date: noClassDay?.date || "",
    observations: noClassDay?.observations || "",
  };
}

export default function useNoClassDayShow(noClassDayId) {
  const navigate = useNavigate();

  const [noClassDay, setNoClassDay] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapNoClassDayToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchNoClassDay = useCallback(async () => {
    if (!noClassDayId) return;

    setLoading(true);
    try {
      const res = await api.get(`no_class_days/${noClassDayId}`);
      const item = res?.ok ? res?.data : null;
      setNoClassDay(item);
    } finally {
      setLoading(false);
    }
  }, [noClassDayId]);

  useEffect(() => {
    fetchNoClassDay();
  }, [fetchNoClassDay]);

  useEffect(() => {
    if (!noClassDay) return;
    setForm(mapNoClassDayToForm(noClassDay));
  }, [noClassDay, isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrors({});
    setForm(mapNoClassDayToForm(noClassDay));
  }, [noClassDay]);

  const onChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setForm((prev) => ({ ...prev, [name]: value }));
      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const save = useCallback(async () => {
    const result = validarCamposReact(form, baseSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      const payload = {
        ficha_id: Number(form.ficha_id),
        reason_id: Number(form.reason_id),
        date: form.date,
        observations: form.observations?.trim() || null,
      };

      const res = await api.put(`no_class_days/${noClassDayId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar el día sin clase.");
        return false;
      }

      await success(res.message || "Día sin clase actualizado con éxito.");
      setIsEditing(false);
      await fetchNoClassDay();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, noClassDayId, fetchNoClassDay]);

  const deleteNoClassDay = useCallback(async () => {
    const confirmed = await confirm(
      "¿Eliminar este día sin clase permanentemente?"
    );
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      const res = await api.delete(`no_class_days/${noClassDayId}`);
      if (!res.ok) {
        await error(res.message || "No se pudo eliminar.");
        return false;
      }

      await success("Día sin clase eliminado!");
      navigate("/no_class_days");
      return true;
    } catch (e) {
      await error(e?.message || "Error al eliminar.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [noClassDayId, navigate]);

  return {
    noClassDay,
    loading,

    isEditing,
    form,
    errors,
    saving,

    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteNoClassDay,

    refetch: fetchNoClassDay,
  };
}