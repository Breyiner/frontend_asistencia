import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const baseSchema = [
  { name: "ficha_id", type: "select", required: true },
  { name: "reason_id", type: "select", required: true },
  { name: "date", type: "date", required: true },
  { name: "observations", type: "text", required: false, maxLength: 1000 },
];

export default function useNoClassDayCreate() {
  const [form, setForm] = useState({
    ficha_id: "",
    reason_id: "",
    date: "",
    observations: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, baseSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      const payload = {
        ficha_id: Number(form.ficha_id),
        reason_id: Number(form.reason_id),
        date: form.date,
        observations: form.observations?.trim() || null,
      };

      const res = await api.post("no_class_days", payload);
      if (!res.ok) {
        await error(res.message || "No se pudo crear el día sin clase.");
        return false;
      }

      await success(res.message || "Día sin clase creado con éxito.");
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