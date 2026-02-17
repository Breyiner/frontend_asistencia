// Hook de React para estado local
import { useState } from "react";

// Componentes de formulario
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Utilidades y hooks
import { validarCamposReact } from "../../utils/validators";
import { useRegister } from "../../hooks/useRegister";

/**
 * Esquema de validación para formulario de registro.
 * Define reglas para todos los campos del aprendiz.
 */
const registerSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "document_type_id", required: true, maxLength: 40 },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 },
  { name: "password", type: "password", required: true, minLength: 8, maxLength: 60 },
];

/**
 * Formulario de registro completo de nuevos usuarios.
 * 
 * Características:
 * - Layout responsive en filas de 2 columnas
 * - Select tipos documento hardcodeado
 * - Validación completa por campo
 * - Integración con hook useRegister
 * 
 * Flujo:
 * 1. Usuario completa todos los campos
 * 2. Validación al submit
 * 3. Si válido → llama register()
 * 
 * @component
 * @returns {JSX.Element} Formulario completo de registro
 */
export default function RegisterFormPage() {
  // Hook que gestiona llamada API de registro y estado loading
  const { register, loading } = useRegister();

  // Estado inicial del formulario con valores por defecto
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    document_type_id: 1,
    document_number: "",
    email: "",
    telephone_number: "",
    password: "",
  });

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
   * Valida → llama register si válido.
   * 
   * @async
   */
  const onSubmit = async (e) => {
    e.preventDefault(); // Previene recarga página

    // Valida todos los campos según esquema
    const result = validarCamposReact(form, registerSchema);
    setFieldErrors(result.errors);

    // Si hay errores, no continúa
    if (!result.ok) return;

    // Envía datos al backend
    await register(result.data);
  };

  return (
    <form className="register__form" onSubmit={onSubmit} autoComplete="off" noValidate>
      {/* Fila 1: Nombres y apellidos */}
      <div className="register__row">
        <InputField 
          label="Nombres" 
          name="first_name" 
          value={form.first_name} 
          onChange={onChange}
          placeholder="Breynner Alexis" 
          required 
          maxLength={80} 
          error={fieldErrors.first_name} 
        />
        <InputField 
          label="Apellidos" 
          name="last_name" 
          value={form.last_name} 
          onChange={onChange}
          placeholder="Acosta Sandoval" 
          required 
          maxLength={80} 
          error={fieldErrors.last_name} 
        />
      </div>

      {/* Fila 2: Tipo documento y número */}
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

      {/* Fila 3: Email y teléfono */}
      <div className="register__row">
        <InputField 
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
        <InputField 
          label="Teléfono" 
          name="telephone_number" 
          value={form.telephone_number} 
          onChange={onChange}
          placeholder="3001234567" 
          required 
          maxLength={20} 
          error={fieldErrors.telephone_number} 
        />
      </div>

      {/* Contraseña */}
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

      {/* Botón submit */}
      <Button disabled={loading} type="submit">
        {loading ? "Registrando..." : "Registrarse"}
      </Button>
    </form>
  );
}
