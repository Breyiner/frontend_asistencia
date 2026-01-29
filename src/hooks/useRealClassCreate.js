import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const baseSchema = [
  { name: "instructor_id", type: "select", required: true },
  { name: "classroom_id", type: "select", required: true },
  { name: "time_slot_id", type: "select", required: true },

  { name: "schedule_session_id", type: "select", required: true },

  { name: "class_type_id", type: "select", required: true },
  { name: "start_hour", type: "text", required: true },
  { name: "end_hour", type: "text", required: true },
  { name: "observations", type: "text", required: false, maxLength: 500 },
];

export default function useRealClassCreate() {
  const [form, setForm] = useState({
    ficha_id: "",
    instructor_id: "",
    classroom_id: "",
    time_slot_id: "",
    schedule_session_id: "",
    class_type_id: "",
    start_hour: "",
    end_hour: "",
    observations: "",
    original_date: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "ficha_id") {
        next.schedule_session_id = "";
      }

      if (name === "class_type_id" && String(value) !== "3") {
        next.original_date = "";
      }

      return next;
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
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
      setLoading(true);

      const payload = {
        instructor_id: Number(form.instructor_id),
        classroom_id: Number(form.classroom_id),
        time_slot_id: Number(form.time_slot_id),
        schedule_session_id: Number(form.schedule_session_id),
        class_type_id: Number(form.class_type_id),
        start_hour: form.start_hour,
        end_hour: form.end_hour,
        observations: form.observations?.trim() || null,

        original_date: String(form.class_type_id) === "3" ? (form.original_date || null) : null,
      };

      const res = await api.post("real_classes", payload);
      if (!res.ok) {
        await error(res.message || "No se pudo crear la clase.");
        return false;
      }

      await success(res.message || "Clase creada con éxito.");
      return { ok: true, data: res.data };
    } catch (e) {
      await error(e?.message || "Error de conexión.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { form, errors, loading, onChange, validateAndSave };
}