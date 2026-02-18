// React Router hooks para navegación y estado de ruta
import { useLocation, useNavigate, Link } from "react-router-dom"; // Location (estado), navigate, Link

// Utilidad de autenticación global
import { isAuth } from "../../utils/auth"; // Verifica sesión activa

// Estilos específicos de página de error
import "./UnauthorizedPage.css";
import Button from "../../components/Button/Button";

/**
 * Página de error 403 - Acceso denegado por falta de permisos.
 * 
 * Interfaz de error amigable con 3 acciones contextuales:
 * 1. Autenticado: "Volver" (a página original o anterior)
 * 2. No autenticado: "Iniciar sesión" (Link directo)
 * 3. Siempre: "Ir al inicio" (home)
 * 
 * UX inteligente:
 * - Preserva origen via location.state.from (ProtectedRoute)
 * - replace: true limpia historial (no back infinito)
 * - Logo institucional para confianza
 * - Diseño centrado responsive
 * 
 * Flujo:
 * 1. ProtectedRoute detecta falta permiso → redirige aquí
 * 2. Extrae from del state (página protegida)
 * 3. Render condicional según isAuth()
 * 4. Usuario elige acción → navega limpio
 * 
 * @component
 * @returns {JSX.Element} Error 403 contextual con navegación inteligente
 */
export default function UnauthorizedPage() {
  // Navegación programática con replace
  const navigate = useNavigate();

  // Estado de la ruta original (inyectado por ProtectedRoute)
  const location = useLocation();
  const from = location.state?.from; // Página que intentó acceder

  /**
   * Handler inteligente de "Volver".
   * 
   * Prioridad:
   * 1. Si existe from → navega ahí (replace: limpia historial)
   * 2. Fallback: navigate(-1) → página anterior
   */
  const handleBack = () => {
    if (from) return navigate(from, { replace: true }); // Ruta original preservada
    navigate(-1); // Página anterior del historial
  };

  return (
    <section className="unauthorized"> {/* Sección completa centrada */}
      <div className="unauthorized__card"> {/* Tarjeta principal de error */}
        {/* Logo institucional arriba (branding/trust) */}
        <div className="unauthorized__logoWrap">
          <img
            src="/logo_sena_white.png"      // Logo SENA blanco
            alt="Logo SENA"                 // Accesibilidad
            className="unauthorized__logo"  // Estilos específicos
          />
        </div>

        {/* Header con título y explicación */}
        <header className="unauthorized__header">
          <h1 className="unauthorized__title">403 Acceso denegado</h1> {/* Título HTTP estándar */}
          <p className="unauthorized__text">
            {/* Mensaje claro con CTA a admin */}
            No tienes permisos para acceder a esta sección. Si crees que es un error,
            contacta al administrador.
          </p>
        </header>

        {/* Zona de acciones contextuales */}
        <div className="unauthorized__actions">
          {isAuth() ? ( // Condicional según estado de sesión
            // USUARIO AUTENTICADO: botón "Volver" inteligente
            <Button
              variant="secondary"
              type="button"
              onClick={handleBack}  // Lógica contextual from/-1
            >
              Volver
            </Button>
          ) : (
            // NO AUTENTICADO: Link directo a login
            <Button
              variant="secondary"
              type="button"
              onClick={() => navigate('/login')}
            >
              Iniciar sesión
            </Button>
          )}

        </div>
      </div>
    </section>
  );
}
