// Hook de React para estado local
import { useState } from "react";

// Componentes de formulario para LoginFormPage
import TextField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";
import ForgotPasswordLink from "../../components/ForgotPasswordLink/ForgotPasswordLink";

// Hook de autenticación y validación
import { useLogin } from "../../hooks/useLogin";
import { validarCamposReact } from "../../utils/validators";

/**
 * Esquema de validación para formulario de login.
 * Define reglas para email y password.
 */
const loginSchema = [
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "password", type: "password", required: true, minLength: 8, maxLength: 60 },
];

/**
 * Formulario de login con validación en cliente.
 * 
 * Características:
 * - Validación en tiempo real por campo
 * - Limpieza automática de errores al escribir
 * - Esquema de validación predefinido
 * - Integración con hook useLogin
 * - Enlace recuperación contraseña
 * 
 * Flujo:
 * 1. Usuario completa email/password
 * 2. Validación al submit
 * 3. Si válido → llama login()
 * 
 * @component
 * @returns {JSX.Element} Formulario completo de login
 */
export default function LoginFormPage() {
  // Hook que gestiona llamada API de login y estado loading
  const { login, loading } = useLogin();

  // Estado del formulario
  const [form, setForm] = useState({ email: "", password: "" });
  
  // Estado de errores por campo
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Maneja cambios en campos del formulario.
   * Actualiza estado y limpia error del campo.
   */
  const onChange = (e) => {
    const { name, value } = e.target;

    // Actualiza campo específico en form
    setForm((p) => ({ ...p, [name]: value }));

    // Limpia error del campo si existía
    if (fieldErrors[name]) {
      setFieldErrors((p) => ({ ...p, [name]: "" }));
    }
  };

  /**
   * Maneja envío del formulario.
   * Valida → llama login si válido.
   * 
   * @async
   */
  const onSubmit = async (e) => {
    e.preventDefault(); // Previene recarga página

    // Valida todos los campos según esquema
    const result = validarCamposReact(form, loginSchema);
    setFieldErrors(result.errors);

    // Si hay errores, no continúa
    if (!result.ok) return;

    // Envía credenciales al backend
    await login(result.data);
  };

  return (
    <form className="login__form" onSubmit={onSubmit} autoComplete="off" noValidate>
      {/* Campo email */}
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

      {/* Campo contraseña */}
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

      {/* Enlace recuperación contraseña */}
      <ForgotPasswordLink to="/forgot-password" />

      {/* Botón submit */}
      <Button disabled={loading} type="submit">
        {loading ? "Accediendo..." : "Acceder"}
      </Button>
    </form>
  );
}
