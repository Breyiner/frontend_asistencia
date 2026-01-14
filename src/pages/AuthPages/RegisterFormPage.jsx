import { useState } from "react";

import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import { validarCamposReact } from "../../utils/validators";
import { useRegister } from "../../hooks/useRegister";

const registerSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "document_type_id", required: true, maxLength: 40 },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 },
  { name: "password", type: "password", required: true, minLength: 8, maxLength: 60 },
];

export default function RegisterFormPage() {
  const { register, loading } = useRegister();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    document_type_id: 1,
    document_number: "",
    email: "",
    telephone_number: "",
    password: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const onChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => ({ ...p, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const result = validarCamposReact(form, registerSchema);
    setFieldErrors(result.errors);

    if (!result.ok) return;

    await register(result.data);
  };

  return (
    <form className="register__form" onSubmit={onSubmit} autoComplete="off" noValidate>
      <div className="register__row">
        <InputField label="Nombres" name="first_name" value={form.first_name} onChange={onChange}
          placeholder="Breynner Alexis" required maxLength={80} error={fieldErrors.first_name} />
        <InputField label="Apellidos" name="last_name" value={form.last_name} onChange={onChange}
          placeholder="Acosta Sandoval" required maxLength={80} error={fieldErrors.last_name} />
      </div>

      <div className="register__row">
        <InputField
          label="Tipo de documento"
          name="document_type_id"
          value={form.document_type_id}
          onChange={onChange}
          required
          options={[
            { value: 1, label: "Cédula de Ciudadanía" },
            { value: 2, label: "Tarjeta de Identidad" },
            { value: 3, label: "Cédula de Extranjería" },
            { value: 4, label: "Pasaporte" },
          ]}
          error={fieldErrors.document_type_id}
        />

        <InputField
          label="Documento"
          name="document_number"
          value={form.document_number}
          onChange={onChange}
          placeholder="1234567890"
          required
          maxLength={20}
          error={fieldErrors.document_number}
        />
      </div>

      <div className="register__row">
        <InputField label="Correo" name="email" type="email" value={form.email} onChange={onChange}
          placeholder="correo@dominio.com" required maxLength={120} error={fieldErrors.email} />
        <InputField label="Teléfono" name="telephone_number" value={form.telephone_number} onChange={onChange}
          placeholder="3001234567" required maxLength={20} error={fieldErrors.telephone_number} />
      </div>

      <InputField
        label="Contraseña"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        placeholder="********"
        required
        minLength={8}
        maxLength={60}
        error={fieldErrors.password}
      />

      <Button disabled={loading} type="submit">
        {loading ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
}