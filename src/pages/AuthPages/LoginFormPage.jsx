import { useState } from "react";

import TextField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import ForgotPasswordLink from "../../components/ForgotPasswordLink/ForgotPasswordLink";

import { useLogin } from "../../hooks/useLogin";
import { validarCamposReact } from "../../utils/validators";

const loginSchema = [
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "password", type: "password", required: true, minLength: 8, maxLength: 60 },
];

export default function LoginFormPage() {
  const { login, loading } = useLogin();

  const [form, setForm] = useState({ email: "", password: "" });
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

    const result = validarCamposReact(form, loginSchema);
    setFieldErrors(result.errors);

    if (!result.ok) return;

    await login(result.data);
  };

  return (
    <form className="login__form" onSubmit={onSubmit} autoComplete="off" noValidate>
      <TextField
        label="Correo"
        name="email"
        type="email"
        value={form.email}
        onChange={onChange}
        placeholder="correo@dominio.com"
        required
        maxLength={120}
        error={fieldErrors.email}
      />

      <TextField
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

      <ForgotPasswordLink to="/forgot-password" />

      <Button disabled={loading} type="submit">
        {loading ? "Accediendo..." : "Acceder"}
      </Button>
    </form>
  );
}