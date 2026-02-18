// Importa el componente NotificationBell desde su ubicación relativa
// Este componente muestra un icono de campana con notificaciones
import NotificationBell from "../NotificationBell/NotificationBell";

// Importa el componente RoleSelector desde su ubicación relativa
// Este componente permite al usuario seleccionar o cambiar su rol en la aplicación
import RoleSelector from "../RoleSelector/RoleSelector";

// Importa el componente NotificationsBootstrapper desde su ubicación relativa
// Inicializa y configura el sistema de notificaciones antes de renderizar la campana
import NotificationsBootstrapper from "../NotificationsBootstrapper/NotificationsBootstrapper";

// Importa la utilidad de verificación de permisos Spatie
// Permite mostrar/ocultar elementos según los permisos del usuario autenticado
import { can } from "../../utils/auth";

// Importa el archivo CSS que contiene los estilos específicos para este componente
import "./AppHeader.css";

/**
 * Componente de cabecera principal de la aplicación.
 *
 * Renderiza un header con un título dinámico y una sección de acciones que incluye:
 * - Sistema de notificaciones (inicializador y campana), protegido por permisos
 * - Selector de roles de usuario
 *
 * Permisos Spatie requeridos para notificaciones:
 * - notifications.viewAny: campana, contador badge y últimas notificaciones
 *
 * @component
 * @param {Object} props         - Propiedades del componente
 * @param {string} props.title   - Título que se muestra en el encabezado
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

  /**
   * Verificación de permiso para mostrar el sistema de notificaciones.
   *
   * notifications.viewAny cubre los endpoints de la campana:
   * - GET /notifications/latest   → últimas N notificaciones
   * - GET /notifications/unread_count → contador del badge
   * - GET /notifications/me       → listado paginado del usuario
   */
  const canViewNotifications = can("notifications.viewAny");

  // Retorna el JSX que representa la estructura del header
  return (

    // Elemento <header> semántico HTML5 con clase CSS para estilos
    <header className="app-header">

      {/* Título principal (h1) que muestra el valor recibido por props
          La clase BEM indica que es el título del app-header */}
      <h1 className="app-header__title">{title}</h1>

      {/* Contenedor div para agrupar los elementos de acción del header
          La clase BEM indica que es la sección de acciones del app-header */}
      <div className="app-header__actions">

        {/* Renderiza el sistema de notificaciones solo si el usuario tiene permiso.
            NotificationsBootstrapper debe montarse antes que NotificationBell
            para configurar el contexto que la campana necesita */}
        {canViewNotifications && (
          <>
            <NotificationsBootstrapper />
            <NotificationBell />
          </>
        )}

        {/* Renderiza el componente selector de roles
            Permite cambiar el rol activo del usuario */}
        <RoleSelector />

      </div>
    </header>
  );
}