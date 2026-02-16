import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const areaCreateSchema = [
  { name: "name", type: "text", required: true, maxLength: 80 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

export default function useAreaCreate() {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, areaCreateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim() || null,
      };

      const res = await api.post("areas", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el área.");
        return false;
      }

      const createdId = res?.data?.id ?? null;

      await success(res.message || "Área creada con éxito.");
      return { ok: true, createdId };
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setErrors({});
  };

  return {
    form,
    errors,
    loading,
    onChange,
    validateAndSave,
    resetForm,
  };
}
