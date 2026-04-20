// React hooks para estado, efectos y router
import { useEffect, useState } from 'react'; // Estado local + efectos secundarios
import { useSearchParams, useNavigate } from 'react-router-dom'; // Query params + navegación

// API y componentes UI
import { api } from '../../services/apiClient'; // Cliente HTTP configurado
import Button from '../../components/Button/Button'; // Botón reutilizable con variantes

// Estilos específicos de verificación
import './VerifyEmail.css';

/**
 * Página de verificación de email vía URL firmada de Laravel.
 *
 * Procesa ?verify_url=<url_firmada_laravel> de la URL del frontend.
 * La verify_url contiene internamente: /api/email/verify/{id}/{hash}?expires=...&signature=...
 *
 * **3 estados visuales estrictos**:
 * 1. loading: spinner + "Verificando tu correo"
 * 2. success: ✓ + mensaje servidor + botón login
 * 3. error:   ✕ + mensaje + botón login
 *
 * Flujo automático:
 * 1. Extrae verify_url del query string del frontend
 * 2. Si falta → error inmediato
 * 3. GET a la verify_url firmada de Laravel → maneja ok/error
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
  // Query params de URL (?verify_url=...)
  const [searchParams] = useSearchParams();
  // Navegación programática post-verificación
  const navigate = useNavigate();

  /**
   * Estados reactivos centrales:
   * - status:  'loading' | 'success' | 'error' (controla TODO el render)
   * - message: texto específico según resultado del servidor
   */
  const [status, setStatus] = useState('loading'); // Estado inicial: spinner
  const [message, setMessage] = useState('');      // Mensaje dinámico del servidor

  // Extrae la URL firmada de Laravel del query string del frontend
  // Ejemplo: ?verify_url=http://localhost/api/email/verify/4/hash?expires=...&signature=...
  const verifyUrl = searchParams.get('verify_url'); // URL absoluta firmada por Laravel

  /**
   * Efecto único de verificación automática.
   *
   * Secuencia:
   * 1. Valida presencia de verify_url en el query string
   * 2. Si falta → error inmediato (enlace malformado o directo sin parámetros)
   * 3. GET a la verify_url firmada de Laravel (URL absoluta del backend)
   * 4. Maneja respuesta → actualiza status/message
   *
   * NOTA: Se usa GET porque Laravel genera URLs firmadas que se consumen
   * con GET. La firma (signature) y expiración (expires) van en la propia URL.
   */
  useEffect(() => {
    // Validación temprana: parámetro obligatorio
    if (!verifyUrl) {
      setStatus('error');                           // Estado error inmediato
      setMessage('Enlace de verificación inválido');
      return;                                       // Sale temprano sin llamar al API
    }

    /**
     * Función interna asíncrona de verificación.
     *
     * Llama directamente a la URL firmada de Laravel usando fetch nativo,
     * ya que es una URL absoluta externa al cliente configurado de api.
     * Laravel valida internamente: existencia del usuario, hash del email,
     * expiración del enlace y firma criptográfica.
     */
    const verificarEmail = async () => {
      try {
        // Llamada GET directa a la URL firmada de Laravel
        // Se incluyen las credenciales por si Laravel requiere la cookie de sesión
        const res = await fetch(verifyUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json', // Fuerza respuesta JSON en lugar de HTML
          },
        });

        // Intenta parsear la respuesta como JSON
        // Laravel puede retornar { message: '...' } o similar
        const data = await res.json().catch(() => ({})); // Fallback a objeto vacío si no es JSON

        if (res.ok) {
          // ÉXITO: estado verde + mensaje del servidor o fallback genérico
          setStatus('success');
          setMessage(data.message || 'Email verificado exitosamente');
        } else {
          // ERROR HTTP (403 firma inválida, 400 expirado, 404 usuario, etc.)
          setStatus('error');
          setMessage(data.message || 'Error al verificar el email');
        }
      } catch (err) {
        // ERROR DE RED: sin conexión, CORS bloqueado, timeout, etc.
        setStatus('error');
        setMessage('No se pudo conectar con el servidor');
      }
    };

    verificarEmail(); // Ejecuta verificación al montar
  }, [verifyUrl]);   // Solo re-ejecuta si cambia la URL de verificación

  /**
   * Handler del botón "Ir al login".
   * Usa replace para no dejar la página de verificación en el historial.
   */
  const handleGoToLogin = () => {
    navigate('/login', { replace: true }); // Historial limpio post-verificación
  };

  return (
    <div className="verificar-email"> {/* Contenedor principal centrado */}
      <div className="verificar-email__container"> {/* Wrapper responsive */}
        <div className="verificar-email__card"> {/* Tarjeta visual principal */}

          {/* Icono central condicional (spinner / ✓ / ✕) */}
          <div className="verificar-email__icon">
            {status === 'loading' && (               // ESTADO 1: Spinner animado
              <div className="verificar-email__spinner" />
            )}
            {status === 'success' && (               // ESTADO 2: Check verde
              <div className="verificar-email__check">✓</div>
            )}
            {status === 'error' && (                 // ESTADO 3: X roja
              <div className="verificar-email__check">✕</div>
            )}
          </div>

          {/* Título dinámico con clase CSS condicional para loading */}
          <h1 className={`verificar-email__title ${status === 'loading' ? 'verificar-email__title--loading' : ''}`}>
            {status === 'loading' && 'Verificando tu correo'}   {/* Título loading */}
            {status === 'success' && '¡Email verificado!'}      {/* Título éxito  */}
            {status === 'error'   && 'Error de verificación'}   {/* Título error   */}
          </h1>

          {/* Mensaje principal específico por estado */}
          <p className="verificar-email__message">
            {status === 'loading' && 'Por favor espera mientras verificamos tu cuenta...'}  {/* Espera  */}
            {status === 'success' && message}                                                {/* Msg OK  */}
            {status === 'error'   && message}                                                {/* Msg err */}
          </p>

          {/* Botón login: SOLO visible post-loading (éxito o error) */}
          {status !== 'loading' && (
            <Button onClick={handleGoToLogin} variant='fullWidth-primary'>
              Ir al inicio de sesión
            </Button>
          )}

          {/* Footer contextual: SOLO visible durante loading */}
          {status === 'loading' && (
            <p className="verificar-email__footer">Esto puede tomar unos segundos</p>
          )}

        </div>
      </div>
    </div>
  );
}