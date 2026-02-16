import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const roleCreateSchema = [
  { name: "name", type: "text", required: true, maxLength: 50 },
  { name: "code", type: "text", required: true, maxLength: 30 },
  { name: "description", type: "text", required: false, minLength: 3, maxLength: 255 },
];

function normalizeCode(value) {
  return (value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

export default function useRoleCreate() {
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;

    // opcional: autotransform del code
    if (name === "code") {
      setForm((prev) => ({ ...prev, code: normalizeCode(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, roleCreateSchema);
    if (!result.ok) {
      setErrors(result.errors || {});
      return false;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name?.trim(),
        code: normalizeCode(form.code),
        description: form.description?.trim() || null,
      };

      const res = await api.post("roles", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el rol.");
        return false;
      }

      const createdId = res?.data?.id ?? null;

      await success(res.message || "Rol creado con éxito.");
      return { ok: true, createdId };
    } catch (e) {
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ name: "", code: "", description: "" });
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
