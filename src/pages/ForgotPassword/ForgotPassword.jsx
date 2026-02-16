// Importaciones de React y React Router
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Servicios y utilidades
import { api } from '../../services/apiClient';
import { validarCamposReact } from '../../utils/validators';

// Componentes de formulario
import TextField from '../../components/InputField/InputField';
import Button from '../../components/Button/Button';

// Estilos específicos de la página
import "./ForgotPassword.css";

/**
 * Esquema de validación para formulario de recuperación de contraseña.
 * 
 * Define reglas para el campo único requerido:
 * - document_number: texto obligatorio, máximo 20 caracteres
 */
const forgotPasswordSchema = [
  { name: "document_number", type: "text", required: true, maxLength: 20 },
];

/**
 * Página de recuperación de contraseña por número de documento.
 * 
 * Permite al usuario solicitar un enlace de restablecimiento enviando
 * su número de documento. Incluye validación frontend, llamada API,
 * feedback visual y redirección automática post-éxito.
 * 
 * Características:
 * - Formulario simple de un campo con validación en tiempo real
 * - Estados de carga, éxito y error diferenciados
 * - Limpieza automática de mensajes al interactuar
 * - Redirección automática a login tras 2.5s de éxito
 * - Diseño centrado responsive con card visual
 * - Botones contextuales (Enviar / Volver a login)
 * 
 * Flujo:
 * 1. Usuario ingresa número de documento
 * 2. Validación frontend inmediata
 * 3. POST a /forgot-password con datos validados
 * 4. Muestra mensaje de éxito/error según respuesta
 * 5. Redirección automática o manual a login
 * 
 * @component
 * @returns {JSX.Element} Formulario de recuperación de contraseña
 */
export default function ForgotPassword() {
  // Navegación programática
  const navigate = useNavigate();

  /**
   * Estado del formulario controlado.
   * 
   * Campo único: document_number (string)
   */
  const [form, setForm] = useState({ document_number: '' });

  /**
   * Errores específicos por campo de formulario.
   * 
   * Objeto dinámico { campo: mensaje_error }
   */
  const [fieldErrors, setFieldErrors] = useState({});

  /**
   * Estado de carga durante envío de solicitud.
   * 
   * Deshabilita formulario y muestra texto alternativo en botón.
   */
  const [loading, setLoading] = useState(false);

  /**
   * Mensaje de éxito tras envío exitoso.
   * 
   * Se muestra temporalmente antes de redirección automática.
   */
  const [message, setMessage] = useState('');

  /**
   * Mensaje de error tras fallo en API.
   * 
   * Muestra errores del servidor o genéricos.
   */
  const [error, setError] = useState('');

  /**
   * Handler unificado de cambios en campos de formulario.
   * 
   * @param {Event} e - Evento de cambio de input
   * 
   * Actualiza:
   * 1. Estado del formulario
   * 2. Limpia error específico del campo
   * 3. Limpia mensajes globales (error/success)
   */
  const onChange = (e) => {
    const { name, value } = e.target;
    
    setForm((prev) => ({ ...prev, [name]: value }));
    
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Limpiar mensajes al escribir
    if (error) setError('');
    if (message) setMessage('');
  };

  /**
   * Handler de envío de formulario con validación completa.
   * 
   * @async
   * @param {Event} e - Evento de submit
   * 
   * Secuencia:
   * 1. Previene envío por defecto
   * 2. Valida campos con esquema predefinido
   * 3. Si inválido, establece errores y retorna
   * 4. Activa loading y limpia mensajes previos
   * 5. POST a /forgot-password
   * 6. Maneja respuesta (éxito/error)
   * 7. Redirección automática tras 2.5s en éxito
   */
  const onSubmit = async (e) => {
    e.preventDefault();
    
    const result = validarCamposReact(form, forgotPasswordSchema);
    setFieldErrors(result.errors);
    
    if (!result.ok) return;
    
    setLoading(true);
    setError('');
    setMessage('');

    const response = await api.post('forgot-password', result.data);

    if (!response.ok) {
      setError(response.message || 'Error al enviar solicitud');
      setLoading(false);
      return;
    }

    setMessage(response.message);
    setLoading(false);

    // Redirección automática tras mostrar mensaje de éxito
    setTimeout(() => navigate('/login'), 2500);
  };

  return (
    <div className="olvide-password__layout">
      <div className="olvide-password__card">
        {/* Título principal de la página */}
        <h1 className="olvide-password__title">¿Olvidaste tu contraseña?</h1>
        
        {/* Subtítulo explicativo del proceso */}
        <p className="olvide-password__subtitle">
          Ingresa tu número de documento y te enviaremos un enlace para restablecerla
        </p>

        {/* Mensajes de feedback globales */}
        {error && <div className="olvide-password__error">{error}</div>}
        {message && <div className="olvide-password__success">{message}</div>}

        {/* Formulario principal */}
        <form onSubmit={onSubmit} className="olvide-password__form" noValidate>
          <TextField
            label="Número de documento"
            name="document_number"
            type="text"
            value={form.document_number}
            onChange={onChange}
            placeholder="Ej: 12345678"
            required
            maxLength={20}
            error={fieldErrors.document_number}
            disabled={loading}
          />

          {/* Contenedor de botones de acción */}
          <div className="olvide-password__buttons">
            {/* Botón principal de envío */}
            <Button type="submit" disabled={loading || !form.document_number}>
              {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </Button>

            {/* Botón secundario para volver a login */}
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              disabled={loading}
            >
              ← Volver al inicio de sesión
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
