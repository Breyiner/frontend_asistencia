// Importa el componente NavLink de react-router-dom
// NavLink es similar a Link pero permite aplicar estilos según si la ruta está activa
import { NavLink } from "react-router-dom";

// Importa el componente UserProfile desde su ubicación relativa
// Este componente muestra la información del usuario autenticado
import UserProfile from "../UserProfile/UserProfile";

// Importa el hook personalizado useAuthMenu
// Este hook retorna los items del menú según los permisos del usuario autenticado
import { useAuthMenu } from "../../hooks/useAuthMenu";

// Importa el archivo CSS que contiene los estilos específicos para este componente
import "./AppSidebar.css";

/**
 * Componente de barra lateral (sidebar) de la aplicación.
 * 
 * Renderiza un menú de navegación lateral que incluye:
 * - Branding de la aplicación (logo y título)
 * - Menú de navegación dinámico basado en permisos del usuario
 * - Perfil del usuario en la parte inferior
 * 
 * El menú se genera dinámicamente usando el hook useAuthMenu que filtra
 * las opciones según el rol y permisos del usuario autenticado.
 * 
 * @component
 * 
 * @returns {JSX.Element} Elemento aside con el sidebar completo de la aplicación
 * 
 * @example
 * // Uso básico en el layout principal
 * <div className="app-layout">
 *   <AppSidebar />
 *   <main>{children}</main>
 * </div>
 */
export default function AppSidebar() {
  
  // Obtiene los items del menú filtrados según los permisos del usuario actual
  // useAuthMenu retorna un array de objetos con: { to, icon, label }
  const menuItems = useAuthMenu();

  // Retorna el JSX que representa la estructura del sidebar
  return (
    
    // Elemento <aside> semántico HTML5 para contenido lateral
    // Usa la clase base para aplicar estilos del sidebar
    <aside className="app-sidebar">
      
      {/* Sección de branding - Logo y título de la aplicación */}
      <div className="app-sidebar__brand">
        
        {/* Contenedor del logo */}
        <div className="app-sidebar__logo">
          {/* Imagen del logo SENA
              - src: Ruta del logo en la carpeta public
              - alt: Texto alternativo para accesibilidad */}
          <img src="/logo_sena_white.png" alt="Logo SENA" />
        </div>
        
        {/* Título de la aplicación mostrado junto al logo */}
        <span className="app-sidebar__title">Asistencia SENA</span>
      </div>

      {/* Elemento <nav> semántico para la navegación principal */}
      <nav className="app-sidebar__nav">
        
        {/* Itera sobre cada item del menú obtenido del hook
            map() genera un NavLink por cada elemento del array menuItems */}
        {menuItems.map(item => (
          
          /* NavLink - Componente de react-router-dom para navegación
             - key: Identificador único requerido por React en listas (usa la ruta)
             - to: Ruta de destino del enlace
             - className: Función que recibe {isActive} y retorna clases dinámicas */
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => 
              // Aplica clase base siempre, y agrega clase --active si la ruta está activa
              // isActive es true cuando la URL actual coincide con la ruta del NavLink
              `app-sidebar__item ${isActive ? 'app-sidebar__item--active' : ''}`
            }
          >
            {/* Renderiza el icono del item
                - item.icon es un componente de icono (ej: de react-icons)
                - Se pasa como componente dinámico y se le aplica una clase CSS */}
            <item.icon className="app-sidebar__icon" />
            
            {/* Muestra el texto/etiqueta del item del menú */}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Componente de perfil de usuario en la parte inferior del sidebar
          Muestra información del usuario autenticado (avatar, nombre, etc.) */}
      <UserProfile />
    </aside>
  );
}