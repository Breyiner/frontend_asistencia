// React hooks para estado, efectos y router
import { useEffect, useState } from 'react'; // Estado local + efectos secundarios
import { useSearchParams, useNavigate } from 'react-router-dom'; // Query params + navegación

// API y componentes UI
import { api } from '../../services/apiClient'; // Cliente HTTP configurado
import Button from '../../components/Button/Button'; // Botón reutilizable con variantes

// Estilos específicos de verificación
import './VerifyEmail.css';

/**
 * Página de verificación de email vía token único.
 * 
 * Procesa ?token=xxx&email=xxx de URL para activar cuenta.
 * **3 estados visuales estrictos**:
 * 1. loading: spinner + "Verificando tu correo"
 * 2. success: ✓ + mensaje servidor + botón login
 * 3. error: ✕ + mensaje + botón login
 * 
 * Flujo automático:
 * 1. Extrae token/email de query string
 * 2. Si faltan → error inmediato
 * 3. POST /verify-email → maneja ok/error
 * 4. Feedback visual + botón login
 * 
 * UX optimizada:
 * - Footer contextual (loading vs final)
 * - replace en navigate (historial limpio)
 * - Estados mutuamente excluyentes
 * 
 * @component
 * @returns {JSX.Element} Verificador de email con 3 estados visuales
 */
export default function VerificarEmail() {
  // Query params de URL (?token=...&email=...)
  const [searchParams] = useSearchParams();
  // Navegación programática post-verificación
  const navigate = useNavigate();
  
  /**
   * Estados reactivos centrales:
   * - status: 'loading' | 'success' | 'error' (controla TODO el render)
   * - message: texto específico según resultado
   */
  const [status, setStatus] = useState('loading'); // Estado inicial: spinner
  const [message, setMessage] = useState('');      // Mensaje dinámico

  // Extrae parámetros obligatorios de query string
  const token = searchParams.get('token');         // Token único de verificación
  const email = searchParams.get('email');         // Email asociado

  /**
   * Efecto único de verificación automática.
   * 
   * Secuencia:
   * 1. Valida presencia token + email
   * 2. Si faltan → error inmediato
   * 3. POST /verify-email
   * 4. Maneja respuesta → actualiza status/message
   */
  useEffect(() => {
    // Validación temprana: parámetros obligatorios
    if (!token || !email) {
      setStatus('error');                      // Estado error inmediato
      setMessage('Enlace de verificación inválido');
      return;                                  // Sale temprano
    }

    /**
     * Función interna asíncrona de verificación.
     * 
     * POST /verify-email → maneja ok/error con mensajes del servidor.
     */
    const verificarEmail = async () => {
      const response = await api.post('verify-email', { token, email }); // Llamada sin auth

      if (response.ok) {
        // ÉXITO: estado verde + mensaje servidor
        setStatus('success');
        setMessage(response.message || 'Email verificado exitosamente');
      } else {
        // ERROR: estado rojo + mensaje servidor
        setStatus('error');
        setMessage(response.message || 'Error al verificar el email');
      }
    };

    verificarEmail(); // Ejecuta verificación
  }, [token, email]); // Solo si cambian parámetros

  /**
   * Handler del botón "Ir al login".
   * Navega a login post-verificación (éxito/error).
   */
  const handleGoToLogin = () => {
    navigate('/login'); // Login estándar
  };

  return (
    <div className="verificar-email"> {/* Contenedor principal centrado */}
      <div className="verificar-email__container"> {/* Wrapper responsive */}
        <div className="verificar-email__card"> {/* Tarjeta visual principal */}
          {/* Icono central condicional (spinner/✓/✕) */}
          <div className="verificar-email__icon">
            {status === 'loading' && (                    // ESTADO 1: Spinner
              <div className="verificar-email__spinner" />
            )}
            {status === 'success' && (                    // ESTADO 2: Check verde
              <div className="verificar-email__check">✓</div>
            )}
            {status === 'error' && (                      // ESTADO 3: X roja
              <div className="verificar-email__check">✕</div>
            )}
          </div>

          {/* Título dinámico con clases CSS condicionales */}
          <h1 className={`verificar-email__title ${status === 'loading' ? 'verificar-email__title--loading' : ''}`}>
            {status === 'loading' && 'Verificando tu correo'}      {/* Loading title */}
            {status === 'success' && '¡Email verificado!'}         {/* Success title */}
            {status === 'error' && 'Error de verificación'}        {/* Error title */}
          </h1>

          {/* Mensaje principal específico por estado */}
          <p className="verificar-email__message">
            {status === 'loading' && 'Por favor espera mientras verificamos tu cuenta...'}  {/* Espera */}
            {status === 'success' && message}                                                 {/* Mensaje OK */}
            {status === 'error' && message}                                                   {/* Mensaje error */}
          </p>

          {/* Botón login: SOLO post-loading */}
          {status !== 'loading' && (
            <Button onClick={handleGoToLogin} variant='fullWidth-primary'>
              Ir al inicio de sesión
            </Button>
          )}

          {/* Footer contextual: SOLO loading */}
          {status === 'loading' && (
            <p className="verificar-email__footer">Esto puede tomar unos segundos</p>
          )}
        </div>
      </div>
    </div>
  );
}