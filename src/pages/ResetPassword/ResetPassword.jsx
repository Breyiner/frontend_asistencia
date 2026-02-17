// Importaciones esenciales de React
import { useEffect, useState } from 'react'; // Estados locales y efectos secundarios
import { useSearchParams, useNavigate } from 'react-router-dom'; // Query params y navegación

// Utilidades y servicios
import { validarCamposReact } from '../../utils/validators'; // Validador de formularios React
import { api } from '../../services/apiClient'; // Cliente HTTP con interceptors

// Componentes UI
import TextField from '../../components/InputField/InputField'; // Campo de texto avanzado
import Button from '../../components/Button/Button'; // Botones estandarizados

// Estilos específicos
import "./ResetPassword.css";

/**
 * Esquema de validación para restablecimiento de contraseña.
 * 
 * Reglas aplicadas a ambos campos:
 * - required: obligatorio
 * - minLength: 8 caracteres mínimo
 * - maxLength: 60 caracteres máximo
 * - type: password (validación específica)
 */
const resetPasswordSchema = [
  { name: "password", type: "password", required: true, minLength: 8, maxLength: 60 },
  { name: "password_confirmation", type: "password", required: true, minLength: 8, maxLength: 60 },
];

/**
 * Página de restablecimiento de contraseña vía token.
 * 
 * Procesa ?token=xxx&email=xxx de URL para cambiar contraseña.
 * Incluye validación doble (coincidencia + esquema), feedback visual
 * y redirección automática post-éxito.
 * 
 * Estados visuales:
 * 1. Token inválido → redirección automática a /olvide-password
 * 2. Formulario activo con validación real-time
 * 3. Loading durante POST
 * 4. Éxito/Error con mensajes + auto-login (2s)
 * 
 * Flujo completo:
 * 1. Valida token/email de URL
 * 2. Usuario completa formulario
 * 3. Validación: coincidencia + esquema
 * 4. POST /reset-password
 * 5. Feedback + redirección login
 * 
 * @component
 * @returns {JSX.Element} Formulario de reset con validación completa
 */
export default function ResetPassword() {
  // Extrae parámetros de query string (?token=...&email=...)
  const [searchParams] = useSearchParams();
  // Navegación programática
  const navigate = useNavigate();
  
  /**
   * Estado controlado del formulario:
   * - password: nueva contraseña
   * - password_confirmation: confirmación
   */
  const [form, setForm] = useState({
    password: '',                  // Campo nueva contraseña
    password_confirmation: ''      // Campo confirmación
  });
  
  /**
   * Errores específicos por campo (limpieza reactiva).
   * Formato: { campo: mensaje_error }
   */
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [loading, setLoading] = useState(false); // Loading durante POST
  const [message, setMessage] = useState('');    // Mensaje de éxito
  const [error, setError] = useState('');        // Mensaje de error global

  // Extrae token y email de query params (obligatorios)
  const token = searchParams.get('token');       // Token de restablecimiento (req)
  const email = searchParams.get('email') || ''; // Email usuario (opcional)

  /**
   * Efecto de validación inicial del token.
   * 
   * Si falta token → error inmediato + redirección auto (2s)
   */
  useEffect(() => {
    if (!token) { // Token ausente/inválido
      setError('Enlace inválido. Solicita uno nuevo.'); // Mensaje de error claro
      setTimeout(() => navigate('/olvide-password'), 2000); // Redirección auto
    }
  }, [token, navigate]); // Ejecuta solo al cambiar token o navigate

  /**
   * Handler unificado de cambios en formulario.
   * 
   * @param {Event} e - Evento de input
   * 
   * Acciones:
   * 1. Actualiza estado del campo
   * 2. Limpia error específico del campo
   * 3. Limpia mensajes globales (error/success)
   */
  const onChange = (e) => {
    const { name, value } = e.target; // Extrae nombre y valor del input
    
    // Actualiza formulario manteniendo otros campos
    setForm((prev) => ({ ...prev, [name]: value }));
    
    // Limpia error específico del campo si existía
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    
    // Limpia mensajes globales al escribir (UX limpia)
    if (error) setError('');
    if (message) setMessage('');
  };

  /**
   * Handler principal de envío del formulario.
   * 
   * @async
   * @param {Event} e - Evento submit
   * 
   * Secuencia completa:
   * 1. Previene submit nativo
   * 2. Valida coincidencia manual (password === confirmation)
   * 3. Valida esquema con reglas específicas
   * 4. Activa loading + limpia mensajes
   * 5. POST /reset-password con token/email/data
   * 6. Maneja respuesta (éxito/error)
   * 7. Redirección auto al login (2s éxito)
   */
  const onSubmit = async (e) => {
    e.preventDefault(); // Previene recarga de página
    
    // Validación manual: contraseñas deben coincidir exactamente
    if (form.password !== form.password_confirmation) {
      // Error específico en campo de confirmación
      setFieldErrors({ password_confirmation: 'Las contraseñas no coinciden' });
      return; // Sale temprano
    }
    
    // Validación esquemática (minLength, required, etc.)
    const result = validarCamposReact(form, resetPasswordSchema);
    setFieldErrors(result.errors); // Actualiza errores por campo
    
    if (!result.ok) return; // Sale si validación falla
    
    // Inicia proceso de guardado
    setLoading(true);     // Activa spinner + deshabilita form
    setError('');         // Limpia error previo
    setMessage('');       // Limpia mensaje previo

    // POST al endpoint de reset (incluye token/email)
    const response = await api.post('reset-password', {
      token,              // Token de URL (obligatorio)
      email,              // Email de URL (opcional)
      ...result.data      // Datos validados del form
    });

    if (!response.ok) {
      // Error del servidor
      setError(response.message || 'Error al restablecer contraseña');
      setLoading(false); // Termina loading
      return; // Sale sin redirigir
    }

    // ÉXITO: mensaje + redirección auto
    setMessage(response.message); // Mensaje del servidor
    setLoading(false); // Termina loading
    setTimeout(() => navigate('/login'), 2000); // Auto-login (2 segundos)
  };

  /**
   * Render condicional: token inválido → loading/redirección.
   * 
   * Muestra estado intermedio mientras redirige.
   */
  if (!token) {
    return (
      <div className="reset-password__layout"> {/* Layout centrado */}
        <div className="reset-password__card"> {/* Tarjeta visual */}
          <div className="reset-password__loading">Redirigiendo...</div> {/* Mensaje temporal */}
        </div>
      </div>
    );
  }

  // Render principal: formulario activo
  return (
    <div className="reset-password__layout"> {/* Contenedor centrado responsive */}
      <div className="reset-password__card"> {/* Tarjeta principal */}
        {/* Título descriptivo */}
        <h1 className="reset-password__title">Nueva Contraseña</h1>
        
        {/* Subtítulo con requisitos de seguridad */}
        <p className="reset-password__subtitle">
          Tu contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y símbolo.
        </p>

        {/* Mensajes globales de feedback */}
        {error && <div className="reset-password__error">{error}</div>}      {/* Error rojo */}
        {message && <div className="reset-password__success">{message}</div>} {/* Éxito verde */}

        {/* Formulario principal (noValidate desactiva validación HTML5) */}
        <form onSubmit={onSubmit} className="reset-password__form" noValidate>
          {/* Campo nueva contraseña */}
          <TextField
            label="Nueva contraseña"
            name="password"
            type="password"                    // Oculta caracteres
            value={form.password}
            onChange={onChange}
            placeholder="********"             // Placeholder visual
            required                          // HTML5 required (UX)
            minLength={8}                     // Restricción HTML5
            maxLength={60}                    // Límite razonable
            autoComplete="new-password"       // Hint para gestores de contraseñas
            error={fieldErrors.password}      // Error de validación específica
            disabled={loading}                // Deshabilita durante POST
          />

          {/* Campo confirmación */}
          <TextField
            label="Confirmar nueva contraseña"
            name="password_confirmation"
            type="password"                    // Oculta caracteres
            value={form.password_confirmation}
            onChange={onChange}
            placeholder="********"             // Placeholder visual
            required                          // HTML5 required
            minLength={8}                     // Consistencia con password
            maxLength={60}
            autoComplete="new-password"       // Hint para gestor
            error={fieldErrors.password_confirmation} // Error específico
            disabled={loading}                // Bloqueado durante guardado
          />

          {/* Contenedor de botones */}
          <div className="reset-password__buttons">
            {/* Botón primario: enviar formulario */}
            <Button type="submit" disabled={loading}>
              {loading ? 'Restableciendo...' : 'Cambiar Contraseña'} {/* Texto dinámico */}
            </Button>

            {/* Botón secundario: nuevo enlace */}
            <Button
              variant="ghost"                   // Estilo secundario translúcido
              onClick={() => navigate('/olvide-password')} // Vuelve a solicitar
              disabled={loading}                // Bloqueado durante proceso
            >
              ← Solicitar nuevo enlace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
