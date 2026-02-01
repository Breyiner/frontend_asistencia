import { useState } from "react";
import { api } from "../services/apiClient";
import { validarCamposReact } from "../utils/validators";
import { success, error, info } from "../utils/alertas";

const userCreateSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  {
    name: "telephone_number",
    type: "text",
    required: true,
    minLength: 7,
    maxLength: 20,
  },
  { name: "document_type_id", type: "select", required: true },
  {
    name: "document_number",
    type: "text",
    required: true,
    minLength: 6,
    maxLength: 20,
  },
];

export default function useUserCreate() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    telephone_number: "",
    document_type_id: "",
    document_number: "",
    status_id: "",
    roles: [],
    areas: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const onChange = (e) => {
    const { name, value, multiple, selectedOptions } = e.target;

    const nextValue = multiple
      ? Array.from(selectedOptions).map((opt) => opt.value)
      : value;

    setForm((prev) => ({ ...prev, [name]: nextValue }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateAndSave = async () => {
    const result = validarCamposReact(form, userCreateSchema);

    const extraErrors = {};
    if (!form.roles || form.roles.length === 0) {
      extraErrors.roles = "Selecciona al menos un rol.";
    }
    if (!form.areas || form.areas.length === 0) {
      extraErrors.areas = "Selecciona al menos un área.";
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
        document_type_id: form.document_type_id ? Number(form.document_type_id) : null,
        document_number: form.document_number?.trim(),
        roles: (form.roles || []).map(Number),
        area_ids: (form.areas || []).map(Number),
      };

      const res = await api.post("users", payload);

      if (!res.ok) {
        await error(res.message || "No se pudo crear el usuario.");
        return false;
      }

      const createdId = res?.data?.id ?? res?.data?.user?.id ?? res?.data?.data?.id ?? null;

      await success(res.message || "Usuario creado con éxito.");
      await info(
        "Indica al usuario que revise su correo electronico para activar su cuenta y acceder con las credenciales otorgadas."
      );

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
      document_type_id: "",
      document_number: "",
      status_id: "",
      roles: [],
      areas: [],
    });
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