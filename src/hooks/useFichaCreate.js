import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const fichaCreateSchema = [
  { name: "ficha_number", type: "text", required: true, maxLength: 20 },
  { name: "training_program_id", type: "select", required: true },
  { name: "gestor_id", type: "select", required: true },
  { name: "shift_id", type: "select", required: true },
  { name: "start_date", type: "date", required: true },
  { name: "end_date", type: "date", required: true },
];

export default function useFichaCreate() {
  const [form, setForm] = useState({
    ficha_number: "",
    training_program_id: "",
    gestor_id: "",
    start_date: "",
    end_date: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, fichaCreateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      const payload = {
        ficha_number: form.ficha_number?.trim(),
        training_program_id: form.training_program_id ? Number(form.training_program_id) : null,
        gestor_id: form.gestor_id ? Number(form.gestor_id) : null,
        shift_id: form.shift_id ? Number(form.shift_id) : null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
      };

      const res = await api.post("fichas", payload);

      console.log(res);
      if (!res.ok) {
        await error(res.message || "No se pudo crear la ficha.");
        return false;
      }

      const createdId = res?.data?.id ?? res?.data?.data?.id ?? null;
      await success(res.message || "Ficha creada con éxito.");
      return { ok: true, createdId };
    } catch (e) {
      console.error(e);
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { form, errors, loading, onChange, validateAndSave };
}