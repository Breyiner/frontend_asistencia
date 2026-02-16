import { NavLink } from "react-router-dom";
import { getUser, getCurrentRole } from "../../utils/auth";
import "./UserProfile.css";

/**
 * Componente de perfil de usuario para navegación.
 * 
 * Muestra un enlace clicable al perfil del usuario actual con:
 * - Avatar con iniciales del usuario
 * - Nombre completo
 * - Rol actual
 * 
 * El componente se integra con React Router y obtiene los datos del
 * usuario desde el sistema de autenticación. El NavLink proporciona
 * indicador visual cuando está en la página de perfil.
 * 
 * Características:
 * - Genera automáticamente iniciales del nombre (máximo 2 caracteres)
 * - Aplica estilos activos cuando se está en /profile
 * - Muestra datos en tiempo real del usuario autenticado
 * - Fallback graceful si no hay datos de usuario
 * 
 * @component
 * 
 * @returns {JSX.Element} Link de navegación con avatar e información del usuario
 * 
 * @example
 * // Uso típico en un header o sidebar
 * <header>
 *   <Logo />
 *   <Navigation />
 *   <UserProfile />
 * </header>
 * 
 * @example
 * // El componente mostrará automáticamente:
 * // Avatar: "JP" (iniciales)
 * // Nombre: "Juan Pérez"
 * // Rol: "Instructor"
 * // basándose en getUser() y getCurrentRole()
 */
export default function UserProfile() {
  // Obtiene el usuario actualmente autenticado del sistema de auth
  const user = getUser();
  
  // Obtiene el rol actual del usuario (puede tener múltiples roles)
  const currentRole = getCurrentRole();
  
  /**
   * Genera las iniciales del usuario para mostrar en el avatar.
   * 
   * Proceso:
   * 1. Divide el nombre completo por espacios
   * 2. Toma la primera letra de cada palabra
   * 3. Las une en un string
   * 4. Convierte a mayúsculas
   * 5. Limita a máximo 2 caracteres (slice)
   * 
   * Ejemplos:
   * - "Juan Pérez" → "JP"
   * - "María García López" → "MG"
   * - "Carlos" → "C"
   * - null → "??"
   */
  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '??'; // Fallback si no hay nombre

  return (
    // NavLink de React Router - similar a <Link> pero con soporte para estilos activos
    // to="/profile": navega a la ruta del perfil
    // className recibe una función que incluye isActive (true cuando la ruta coincide)
    <NavLink 
      to="/profile" 
      className={({ isActive }) => `user-profile ${isActive ? 'user-profile--active' : ''}`}
    >
      {/* Avatar circular con iniciales */}
      <div className="user-profile__avatar">{initials}</div>
      
      {/* Información del usuario */}
      <div className="user-profile__info">
        {/* Nombre completo con fallback */}
        <div className="user-profile__name">{user?.name || 'Usuario'}</div>
        
        {/* Rol actual con fallback */}
        {/* "Cargando..." indica que getCurrentRole() puede ser asíncrono */}
        <div className="user-profile__role">{currentRole?.name || 'Cargando...'}</div>
      </div>
    </NavLink>
  );
}
