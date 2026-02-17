// Importa el componente NotificationBell desde su ubicación relativa
// Este componente probablemente muestra un icono de campana con notificaciones
import NotificationBell from "../NotificationBell/NotificationBell";

// Importa el componente RoleSelector desde su ubicación relativa
// Este componente permite al usuario seleccionar o cambiar su rol en la aplicación
import RoleSelector from "../RoleSelector/RoleSelector";

// Importa el componente NotificationsBootstrapper desde su ubicación relativa
// Este componente inicializa o configura el sistema de notificaciones
// (bootstrapper = inicializador/configurador)
import NotificationsBootstrapper from "../NotificationsBootstrapper/NotificationsBootstrapper";

// Importa el archivo CSS que contiene los estilos específicos para este componente
import "./AppHeader.css";

/**
 * Componente de cabecera principal de la aplicación.
 * 
 * Renderiza un header con un título dinámico y una sección de acciones que incluye:
 * - Sistema de notificaciones (inicializador y campana)
 * - Selector de roles de usuario
 * 
 * @component
 * @param {Object} props - Propiedades del componente
 * @param {string} props.title - Título que se muestra en el encabezado
 * 
 * @returns {JSX.Element} Elemento header con título y controles de usuario
 * 
 * @example
 * // Uso básico
 * <AppHeader title="Dashboard Principal" />
 * 
 * @example
 * // En una página específica
 * <AppHeader title="Gestión de Usuarios" />
 */
export default function AppHeader({ title }) {
  
  // Retorna el JSX que representa la estructura del header
  return (
    
    // Elemento <header> semántico HTML5 con clase CSS para estilos
    <header className="app-header">
      
      {/* Título principal (h1) que muestra el valor recibido por props 
          La clase BEM (Block Element Modifier) indica que es el título del app-header */}
      <h1 className="app-header__title">{title}</h1>

      {/* Contenedor div para agrupar los elementos de acción del header
          La clase BEM indica que es la sección de acciones del app-header */}
      <div className="app-header__actions">
        
        {/* Renderiza el componente que inicializa el sistema de notificaciones
            Debe ejecutarse antes que NotificationBell para configurar el contexto */}
        <NotificationsBootstrapper />
        
        {/* Renderiza el componente de la campana de notificaciones
            Muestra las notificaciones al usuario */}
        <NotificationBell />
        
        {/* Renderiza el componente selector de roles
            Permite cambiar el rol activo del usuario */}
        <RoleSelector />
        
      </div>
    </header>
  );
}