import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, confirm } from "../utils/alertas";

const baseSchema = [
  { name: "instructor_id", type: "select", required: true },
  { name: "classroom_id", type: "select", required: true },
  { name: "shift_id", type: "select", required: true },

  { name: "schedule_session_id", type: "select", required: true },

  { name: "class_type_id", type: "select", required: true },
  { name: "start_hour", type: "text", required: true },
  { name: "end_hour", type: "text", required: true },
  { name: "observations", type: "text", required: false, maxLength: 500 },
];

function normalizeTime(t) {
  if (!t) return "";
  return String(t).slice(0, 5);
}

function mapRealClassToForm(realClass) {
  return {
    ficha_id: realClass?.ficha?.id ? String(realClass.ficha.id) : "",

    instructor_id: realClass?.instructor?.id ? String(realClass.instructor.id) : "",
    classroom_id: realClass?.classroom?.id ? String(realClass.classroom.id) : "",
    shift_id: realClass?.shift?.id ? String(realClass.shift.id) : "",

    schedule_session_id: realClass?.schedule_session?.id ? String(realClass.schedule_session.id) : "",

    class_type_id: realClass?.class_type?.id ? String(realClass.class_type.id) : "",
    start_hour: normalizeTime(realClass?.start_hour),
    end_hour: normalizeTime(realClass?.end_hour),

    observations: realClass?.observations || "",

    original_date: realClass?.original_date || "",
  };
}

export default function useRealClassShow(realClassId) {
  const navigate = useNavigate();

  const [realClass, setRealClass] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(mapRealClassToForm(null));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const fetchRealClass = useCallback(async () => {
    if (!realClassId) return;

    setLoading(true);
    try {
      const res = await api.get(`real_classes/${realClassId}`);
      const item = res?.ok ? res?.data : null;
      setRealClass(item);
    } finally {
      setLoading(false);
    }
  }, [realClassId]);

  useEffect(() => {
    fetchRealClass();
  }, [fetchRealClass]);

  useEffect(() => {
    if (!realClass) return;
    setForm(mapRealClassToForm(realClass));
  }, [realClass, isEditing]);

  const startEdit = useCallback(() => {
    setIsEditing(true);
    setErrors({});
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrors({});
    setForm(mapRealClassToForm(realClass));
  }, [realClass]);

  const onChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      setForm((prev) => {
        const next = { ...prev, [name]: value };

        if (name === "class_type_id" && String(value) !== "3") {
          next.original_date = "";
        }

        return next;
      });

      if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    [errors]
  );

  const save = useCallback(async () => {
    const schema = [...baseSchema];
    if (String(form.class_type_id) === "3") {
      schema.push({ name: "original_date", type: "date", required: true });
    }

    const result = validarCamposReact(form, schema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setSaving(true);

      const payload = {
        instructor_id: Number(form.instructor_id),
        classroom_id: Number(form.classroom_id),
        shift_id: Number(form.shift_id),

        schedule_session_id: Number(form.schedule_session_id),

        class_type_id: Number(form.class_type_id),
        start_hour: form.start_hour,
        end_hour: form.end_hour,
        observations: form.observations?.trim() || null,

        original_date: String(form.class_type_id) === "3" ? (form.original_date || null) : null,
      };

      console.log(payload);
      
      const res = await api.patch(`real_classes/${realClassId}`, payload);

      if (!res.ok) {
        await error(res.message || "No se pudo actualizar la clase.");
        return false;
      }

      await success(res.message || "Clase actualizada con éxito.");
      setIsEditing(false);
      await fetchRealClass();
      return true;
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [form, realClassId, fetchRealClass]);

  const deleteRealClass = useCallback(async () => {
    const confirmed = await confirm("¿Eliminar esta clase permanentemente?");
    if (!confirmed.isConfirmed) return false;

    try {
      setSaving(true);

      const res = await api.delete(`real_classes/${realClassId}`);
      if (!res.ok) {
        await error(res.message || "No se pudo eliminar.");
        return false;
      }

      await success("Clase eliminada!");
      navigate("/real_classes");
      return true;
    } catch (e) {
      await error(e?.message || "Error al eliminar.");
      return false;
    } finally {
      setSaving(false);
    }
  }, [realClassId, navigate]);

  return {
    realClass,
    loading,

    isEditing,
    form,
    errors,
    saving,

    startEdit,
    cancelEdit,
    onChange,
    save,
    deleteRealClass,

    refetch: fetchRealClass,
  };
}