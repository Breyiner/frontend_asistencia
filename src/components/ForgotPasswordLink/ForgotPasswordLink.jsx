// Importa Link de react-router-dom para navegación SPA
import { Link } from "react-router-dom";

// Importa estilos del enlace de recuperación de contraseña
import "./ForgotPasswordLink.css";

/**
 * Componente de enlace para recuperación de contraseña.
 * 
 * Proporciona un enlace estilizado que redirige a la página
 * de recuperación de contraseña. Típicamente usado en páginas
 * de login.
 * 
 * Características:
 * - Enlace SPA (sin recargar página)
 * - Texto personalizable
 * - Ruta configurable
 * - Estilos predefinidos consistentes
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} [props.to="/forgot-password"] - Ruta de destino del enlace
 * @param {React.ReactNode} [props.children] - Texto del enlace (por defecto: "¿Olvidaste tu contraseña?")
 * 
 * @returns {JSX.Element} Contenedor con enlace de recuperación
 * 
 * @example
 * // Uso básico con valores por defecto
 * <ForgotPasswordLink />
 * // Renderiza: enlace a "/forgot-password" con texto "¿Olvidaste tu contraseña?"
 * 
 * @example
 * // Con ruta personalizada
 * <ForgotPasswordLink to="/reset-password">
 *   Recuperar contraseña
 * </ForgotPasswordLink>
 * 
 * @example
 * // Uso típico en formulario de login
 * <form>
 *   <InputField label="Email" name="email" />
 *   <InputField label="Contraseña" name="password" type="password" />
 *   <ForgotPasswordLink />
 *   <Button type="submit">Iniciar Sesión</Button>
 * </form>
 */
export default function ForgotPasswordLink({ to = "/forgot-password", children }) {
  return (
    // Contenedor del enlace con clase para estilos
    <div className="forgot">
      
      {/* Link de react-router-dom para navegación SPA
          - to: ruta de destino (por defecto "/forgot-password")
          - children: texto del enlace, usa nullish coalescing (??)
            Si children es null/undefined, usa texto por defecto */}
      <Link className="forgot__link" to={to}>
        {children ?? "¿Olvidaste tu contraseña?"}
      </Link>
    </div>
  );
}