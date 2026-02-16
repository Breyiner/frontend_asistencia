// Importaciones esenciales de React
import { useEffect, useState } from 'react'; // Efectos secundarios y estado local
import { useSearchParams, useNavigate } from 'react-router-dom'; // Parámetros URL y navegación

// Servicios y componentes UI
import { api } from '../../services/apiClient'; // Cliente HTTP configurado
import Button from '../../components/Button/Button'; // Botón reutilizable
import { RiCheckboxCircleLine } from "@remixicon/react"; // Icono de éxito (checkmark verde)

// Estilos específicos de la página
import "./ResendVerification.css";

/**
 * Página de reenvío de email de verificación.
 * 
 * Procesa parámetro 'email' de URL y envía nuevo enlace de verificación.
 * Interfaz con 3 estados visuales:
 * 1. Loading: "Verificando correo..." + spinner
 * 2. Éxito/Error: Mensaje + checkmark + botón login
 * 3. Footer informativo persistente
 * 
 * Flujo automático:
 * 1. Extrae email de query params (?email=usuario@dominio.com)
 * 2. POST a /email/verification-notification
 * 3. Muestra resultado (siempre positivo UX-wise)
 * 4. Botón para ir a login manualmente
 * 
 * Manejo de errores:
 * - Sin email: mensaje de error inmediato
 * - API error: mensaje genérico positivo ("Si existe, se envió")
 * - Éxito: mensaje del servidor o fallback
 * 
 * @component
 * @returns {JSX.Element} Interfaz de reenvío de verificación con feedback visual
 */
export default function ResendVerification() {
  // Extrae parámetros de query string (?email=...)
  const [searchParams] = useSearchParams();
  // Navegación programática al login
  const navigate = useNavigate();
  
  /**
   * Estados locales de UI:
   * - loading: spinner activo durante API call
   * - message: texto dinámico según estado (loading/success/error)
   */
  const [loading, setLoading] = useState(true); // Inicialmente true (spinner)
  const [message, setMessage] = useState('Verificando correo...'); // Mensaje inicial

  /**
   * Efecto único al montar componente (procesa email de URL).
   * 
   * Secuencia:
   * 1. Extrae email de query params
   * 2. Si no existe → error inmediato, termina loading
   * 3. POST al backend con email
   * 4. Maneja then/catch/finally:
   *    - then: mensaje del servidor o fallback
   *    - catch: mensaje genérico (UX positiva)
   *    - finally: termina loading
   */
  useEffect(() => {
    // Obtiene email del query string (?email=usuario@example.com)
    const email = searchParams.get('email');
    
    // Caso crítico: email ausente en URL
    if (!email) {
      setMessage('No se encontró el correo electrónico en el enlace.'); // Error específico
      setLoading(false); // Termina loading inmediatamente
      return; // Sale del efecto temprano
    }

    // POST para reenviar verificación (no requiere auth)
    api.post('email/verification-notification', { email })
      .then((response) => {
        // Éxito: usa mensaje del servidor o fallback detallado
        setMessage(
          response.message || 
          'Si el correo existe, se reenvió el enlace de verificación. Revisa tu bandeja (incluyendo spam).'
        );
      })
      .catch(() => {
        // Error servidor: mensaje genérico pero optimista (UX positiva)
        setMessage('Si el correo existe, se reenvió el enlace de verificación.');
      })
      .finally(() => {
        // Siempre termina loading (éxito/error)
        setLoading(false);
      });
  }, [searchParams]); // Dependencia: solo se ejecuta si cambian params

  /**
   * Handler del botón "Ir al login".
   * Navega directamente a página de login.
   */
  const handleGoLogin = () => {
    navigate('/login'); // Redirección simple
  };

  return (
    <div className="reenviar-verificacion"> {/* Contenedor principal centrado */}
      <div className="reenviar-verificacion__container"> {/* Centrado responsive */}
        <div className="reenviar-verificacion__card"> {/* Tarjeta visual */}
          {/* Icono central: spinner o checkmark según estado */}
          <div className="reenviar-verificacion__icon">
            {loading ? (
              // Spinner durante loading
              <div className="reenviar-verificacion__spinner" />
            ) : (
              // Icono de éxito (checkmark verde grande)
              <span className="reenviar-verificacion__check">
                <RiCheckboxCircleLine size={40} />
              </span>
            )}
          </div>

          {/* Título dinámico con clases CSS condicionales */}
          <h2 className={`reenviar-verificacion__title ${loading ? 'reenviar-verificacion__title--loading' : ''}`}>
            {loading ? 'Enviando correo' : '¡Listo!'} {/* Cambia según loading */}
          </h2>

          {/* Mensaje principal con clases condicionales */}
          <p className={`reenviar-verificacion__message ${loading ? 'reenviar-verificacion__message--subtitle' : ''}`}>
            {loading 
              ? 'Esto puede tardar unos segundos...'  // Mensaje de espera
              : message                              // Mensaje final del resultado
            }
          </p>

          {/* Botón login: solo visible post-loading */}
          {!loading && (
            <Button onClick={handleGoLogin} variant='fullWidth-primary'>
              Ir al login
            </Button>
          )}

          {/* Footer informativo: solo post-loading */}
          {!loading && (
            <p className="reenviar-verificacion__footer">
              {/* Consejo adicional para problemas comunes */}
              ¿No llega el correo? Revisa tu carpeta de spam o contacta al administrador.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
