import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error } from "../utils/alertas";

const apprenticeCreateSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 },

  { name: "birth_date", type: "text", required: true, pattern: /^\d{4}-\d{2}-\d{2}$/, patternMessage: "Fecha inválida (YYYY-MM-DD)" },

  { name: "document_type_id", type: "select", required: true },
  { name: "training_program_id", type: "select", required: true },
  { name: "ficha_id", type: "select", required: true },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
];

function todayYmd() {
  return new Date().toISOString().slice(0, 10);
}

export default function useApprenticeCreate() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    telephone_number: "",
    birth_date: "",
    document_type_id: "",
    document_number: "",
    training_program_id: "",
    ficha_id: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;

    const nextValue = multiple
      ? Array.from(selectedOptions).map((opt) => opt.value)
      : value;

    setForm((prev) => {
      if (name === "training_program_id") {
        return { ...prev, training_program_id: nextValue, ficha_id: "" };
      }
      return { ...prev, [name]: nextValue };
    });

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, apprenticeCreateSchema);

    const extraErrors = {};
    const today = todayYmd();
    if (form.birth_date && form.birth_date >= today) {
      extraErrors.birth_date = "La fecha de nacimiento debe ser anterior a hoy.";
    }

    const mergedErrors = { ...(result?.errors || {}), ...extraErrors };
    setErrors(mergedErrors);

    if (!result.ok || Object.keys(extraErrors).length > 0) return false;

    try {
      setLoading(true);

      const payload = {
        first_name: form.first_name?.trim(),
        last_name: form.last_name?.trim(),
        email: form.email?.trim(),
        telephone_number: form.telephone_number?.trim(),
        birth_date: form.birth_date,
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number: form.document_number?.trim(),
        training_program_id: form.training_program_id ? Number(form.training_program_id) : null,
        ficha_id: form.ficha_id ? Number(form.ficha_id) : null,
      };

      const res = await api.post("apprentices", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el aprendiz.");
        return false;
      }

      const createdId = res?.data?.id ?? res?.data?.data?.id ?? null;

      await success(res.message || "Aprendiz creado con éxito.");
      return { ok: true, createdId };
    } catch (e) {
      console.error(e);
      await error(e?.message || "Error de conexión. Intenta de nuevo.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      first_name: "",
      last_name: "",
      email: "",
      telephone_number: "",
      birth_date: "",
      document_type_id: "",
      document_number: "",
      training_program_id: "",
      ficha_id: "",
    });
    setErrors({});
  };

  return { form, errors, loading, onChange, validateAndSave, resetForm };
}