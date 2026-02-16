// Importa NavLink de react-router-dom para navegación con estado activo
import { NavLink } from "react-router-dom";

// Importa los estilos específicos de las pestañas de autenticación
import "./AuthTabs.css";

/**
 * Componente de pestañas de navegación para autenticación.
 * 
 * Proporciona navegación entre las páginas de Login y Registro mediante
 * pestañas visuales. Utiliza NavLink de react-router-dom para resaltar
 * automáticamente la pestaña activa según la ruta actual.
 * 
 * Características:
 * - Resalta visualmente la pestaña activa
 * - Navegación SPA sin recargar la página
 * - Estilos dinámicos basados en el estado de la ruta
 * 
 * @component
 * 
 * @returns {JSX.Element} Contenedor con dos pestañas: "Iniciar Sesión" y "Registro"
 * 
 * @example
 * // Uso típico en el layout de autenticación
 * <AuthLayout>
 *   <AuthTabs />
 *   <Outlet /> <- Renderiza LoginPage o RegisterPage según la ruta
 * </AuthLayout>
 */
export default function AuthTabs() {
  
  /**
   * Función que retorna las clases CSS según si el NavLink está activo.
   * 
   * NavLink pasa un objeto { isActive } a esta función className.
   * - isActive: true cuando la ruta actual coincide con el prop 'to'
   * 
   * @param {Object} params - Parámetros del NavLink
   * @param {boolean} params.isActive - Indica si esta ruta está activa
   * @returns {string} String de clases CSS aplicadas al link
   */
  const cls = ({ isActive }) =>
    // Si isActive es true, agrega la clase --active
    isActive ? "auth-tabs__btn auth-tabs__btn--active" : "auth-tabs__btn";

  return (
    // Contenedor de las pestañas
    <div className="auth-tabs">
      
      {/* Pestaña de "Iniciar Sesión"
          - to: ruta de destino (/login)
          - className: función que determina las clases según estado activo
          NavLink aplica automáticamente aria-current="page" cuando está activo */}
      <NavLink to="/login" className={cls}>
        Iniciar Sesión
      </NavLink>

      {/* Pestaña de "Registro"
          - to: ruta de destino (/register)
          - className: misma función que determina clases dinámicas */}
      <NavLink to="/register" className={cls}>
        Registro
      </NavLink>
    </div>
  );
}