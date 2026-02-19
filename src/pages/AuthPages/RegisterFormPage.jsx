// Hooks de React para estado y efectos secundarios
import { useState } from "react";

// Componentes reutilizables de formulario
import InputField from "../../components/InputField/InputField";
import Button from "../../components/Button/Button";

// Utilidades de validación y hooks personalizados
import { validarCamposReact } from "../../utils/validators";
import useCatalog from "../../hooks/useCatalog";
import { useRegister } from "../../hooks/useRegister";

/**
 * Esquema de validación frontend para todos los campos de registro.
 * Cada objeto define reglas específicas: tipo, requerido, longitud mínima/máxima.
 * Usado por validarCamposReact() para verificar formulario antes de enviar.
 */
const registerSchema = [
  { name: "first_name", type: "text", required: true, maxLength: 80 },
  { name: "last_name", type: "text", required: true, maxLength: 80 },
  { name: "document_type_id", required: true, type: "number" },
  { name: "document_number", type: "text", required: true, minLength: 6, maxLength: 20 },
  { name: "email", type: "email", required: true, maxLength: 120 },
  { name: "telephone_number", type: "text", required: true, minLength: 7, maxLength: 20 },
  { name: "password", type: "password", required: true, minLength: 8, maxLength: 60 },
];

/**
 * Componente principal de formulario de registro de usuarios.
 * 
 * Estructura responsive en 3 filas de 2 columnas:
 * Fila 1: Nombres + Apellidos
 * Fila 2: Tipo Documento (select dinámico) + Número
 * Fila 3: Email + Teléfono
 * Fila 4: Password (ancho completo)
 * 
 * Características técnicas:
 * - Estado local reactivo para formulario y errores
 * - Catálogo tipos documento cargado dinámicamente del backend
 * - Validación exhaustiva antes de API call
 * - Estados loading para UX (catálogos + submit)
 * - Limpieza automática de errores al escribir
 * 
 * Flujo completo:
 * 1. Carga tipos documento (/document_types/select)
 * 2. Usuario completa campos
 * 3. Submit → validación frontend → POST register()
 * 
 * @returns {JSX.Element} Formulario completo responsive
 */
export default function RegisterFormPage() {
  // Hook personalizado: maneja POST /register + estados loading/error
  const { register, loading } = useRegister();

  // Catálogo dinámico de tipos documento desde backend
  // Carga automática en mount, proporciona options[] con value/label
  const docTypesCatalog = useCatalog("document_types/select");

  // Estado inicial del formulario
  // document_type_id=0 representa "sin seleccionar"
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    document_type_id: 0,
    document_number: "",
    email: "",
    telephone_number: "",
    password: "",
  });

  // Estado reactivo de errores por campo específico
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Handler unificado de cambios en inputs/selects.
   * Actualiza estado del campo y limpia su error correspondiente.
   * 
   * @param {React.ChangeEvent<HTMLInputElement|HTMLSelectElement>} e
   */
  const onChange = (e) => {
    const { name, value } = e.target;

    // Actualización inmutable del campo específico
    setForm((prev) => ({ ...prev, [name]: value }));

    // Limpieza automática del error del campo
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Validación inmediata para document_type_id contra catálogo
    if (name === "document_type_id" && value) {
      const tipoValido = docTypesCatalog.options?.find(opt => opt.value == value);
      if (!tipoValido) {
        setFieldErrors((prev) => ({ 
          ...prev, 
          document_type_id: "Tipo de documento no válido" 
        }));
      }
    }
  };

  /**
   * Handler de envío de formulario.
   * Ejecuta validación completa → API si pasa.
   * 
   * @async
   * @param {React.FormEvent<HTMLFormElement>} e
   */
  const onSubmit = async (e) => {
    e.preventDefault();

    // Verificación previa: tipo documento válido en catálogo
    if (form.document_type_id && 
        !docTypesCatalog.options?.find(opt => opt.value == form.document_type_id)) {
      setFieldErrors(prev => ({ 
        ...prev, 
        document_type_id: "Seleccione un tipo válido del listado" 
      }));
      return;
    }

    // Validación completa según esquema definido
    const validation = validarCamposReact(form, registerSchema);
    setFieldErrors(validation.errors);

    // Aborta si validación falla
    if (!validation.ok) return;

    // Envío seguro al backend con datos validados
    await register(validation.data);
  };

  return (
    /**
     * Formulario principal con prevención nativa de submit
     * autoComplete="off": evita autocompletado navegador en passwords
     * noValidate: desactiva validación HTML5 nativa (usamos custom)
     */
    <form className="register__form" onSubmit={onSubmit} autoComplete="off" noValidate>
      
      {/* Fila 1: Datos personales básicos (nombres completos) */}
      <div className="register__row">
        <InputField 
          label="Nombres" 
          name="first_name" 
          value={form.first_name} 
          onChange={onChange}
          placeholder="Ej: Juan Manuel" 
          required 
          maxLength={80} 
          error={fieldErrors.first_name} 
        />
        <InputField 
          label="Apellidos" 
          name="last_name" 
          value={form.last_name} 
          onChange={onChange}
          placeholder="Ej: García Pérez" 
          required 
          maxLength={80} 
          error={fieldErrors.last_name} 
        />
      </div>

      {/* Fila 2: Identificación oficial */}
      <div className="register__row">
        {/* Select dinámico: opciones reales del backend */}
        <InputField
          label="Tipo de Documento"
          name="document_type_id"
          value={form.document_type_id}
          onChange={onChange}
          options={docTypesCatalog.options || []}
          disabled={docTypesCatalog.loading || loading}
          placeholder={
            docTypesCatalog.loading 
              ? "Cargando tipos..." 
              : !docTypesCatalog.options?.length 
                ? "Error cargando tipos" 
                : "Seleccione tipo"
          }
          error={fieldErrors.document_type_id}
          combo
          required
        />

        {/* Input número vinculado al tipo seleccionado */}
        <InputField
          label="Número de Documento"
          name="document_number"
          value={form.document_number}
          onChange={onChange}
          placeholder="Ej: 1234567890"
          required
          maxLength={20}
          disabled={loading}
          error={fieldErrors.document_number}
        />
      </div>

      {/* Fila 3: Contacto */}
      <div className="register__row">
        <InputField 
          label="Correo Electrónico" 
          name="email" 
          type="email" 
          value={form.email} 
          onChange={onChange}
          placeholder="usuario@dominio.com" 
          required 
          maxLength={120} 
          error={fieldErrors.email} 
        />
        <InputField 
          label="Teléfono" 
          name="telephone_number" 
          value={form.telephone_number} 
          onChange={onChange}
          placeholder="Ej: 3001234567" 
          required 
          maxLength={20} 
          error={fieldErrors.telephone_number} 
        />
      </div>

      {/* Fila 4: Seguridad (ancho completo) */}
      <InputField
        label="Contraseña"
        name="password"
        type="password"
        value={form.password}
        onChange={onChange}
        placeholder="Mínimo 8 caracteres"
        required
        minLength={8}
        maxLength={60}
        error={fieldErrors.password}
      />

      {/* Acción principal con múltiples estados loading */}
      <Button 
        disabled={loading || docTypesCatalog.loading} 
        type="submit"
      >
        {docTypesCatalog.loading 
          ? "Cargando tipos de documento..." 
          : loading 
            ? "Creando cuenta..." 
            : "Registrarse"
        }
      </Button>
    </form>
  );
}
