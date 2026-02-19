// Importaciones de React
import { useEffect } from "react";

// Store de Zustand para gestión global de notificaciones
import { useNotificationsStore } from "../../stores/notificationsStore";

// Componentes específicos de notificaciones
import Paginator from "../../components/Paginator/Paginator";
import NotificationsToolbar from "../../components/NotificationsToolbar/NotificationsToolbar";
import NotificationsList from "../../components/NotificationsList/NotificationsList";

// Importa la utilidad de verificación de permisos Spatie
// Permite mostrar/ocultar acciones según los permisos del usuario autenticado
import { can } from "../../utils/auth";

// Estilos de la página
import "./NotificationsPage.css";

/**
 * Página principal de gestión de notificaciones del usuario.
 *
 * Interfaz completa para visualizar, filtrar, marcar como leídas
 * y eliminar notificaciones con paginación. Utiliza store de Zustand
 * para estado global persistente.
 *
 * Características:
 * - Filtros por estado: Todas, No leídas, Leídas
 * - Conteo dinámico de no leídas en toolbar
 * - Lista virtualizada con acciones por notificación
 * - Paginación server-side (per_page configurado en store)
 * - Carga inicial automática al montar componente
 * - Acciones masivas: Marcar todas como leídas (si tiene permiso)
 * - Estados de carga diferenciados por operación
 *
 * Permisos Spatie utilizados:
 * - notifications.viewAny:     acceso a la lista paginada y filtros
 * - notifications.markAsRead:  marcar una notificación individual como leída
 * - notifications.markAllAsRead: marcar todas las notificaciones como leídas
 * - notifications.delete:      eliminar una notificación individual
 *
 * Estados gestionados por store:
 * - items: array paginado de notificaciones
 * - status: filtro activo ("all", "unread", "read")
 * - page/total/perPage: paginación
 * - unreadCount: contador de no leídas
 * - loadingItems: carga de lista principal
 *
 * Flujo:
 * 1. Carga inicial de todas las notificaciones (página 1)
 * 2. Usuario filtra por estado → reset a página 1
 * 3. Usuario navega paginación → mantiene filtro
 * 4. Acciones individuales/masivas actualizan lista reactivamente
 *
 * @component
 * @returns {JSX.Element} Interfaz completa de notificaciones
 */
export default function NotificationsPage() {
  /**
   * Verificaciones de permisos Spatie.
   *
   * canView:        habilita carga de lista paginada y filtros
   *                 → protege GET /notifications/me
   * canMarkAsRead:  habilita marcar una notificación individual como leída
   *                 → protege PATCH /notifications/{id}/read
   * canMarkAll:     habilita el botón "Marcar todas como leídas"
   *                 → protege PATCH /notifications/read_all
   * canDelete:      habilita el botón de eliminar por notificación
   *                 → protege DELETE /notifications/{id}
   */
  const canView       = can("notifications.viewAny");
  const canMarkAsRead = can("notifications.markAsRead");
  const canMarkAll    = can("notifications.markAllAsRead");
  const canDelete     = can("notifications.delete");

  /**
   * Selectores del store de notificaciones (Zustand).
   *
   * Estado de datos:
   * - items: notificaciones de página actual
   * - loadingItems: carga en progreso
   * - status: filtro activo
   * - page/total/perPage: paginación
   * - unreadCount: contador no leídas
   *
   * Acciones:
   * - fetchItems: carga paginada con filtros
   * - setStatusLocal/setPageLocal: updates locales sin fetch
   * - markAllAsRead/markAsRead: marcar como leída(s)
   * - destroy: eliminar notificación específica
   */
  const items        = useNotificationsStore((s) => s.items);
  const loadingItems = useNotificationsStore((s) => s.loadingItems);
  const status       = useNotificationsStore((s) => s.status);
  const page         = useNotificationsStore((s) => s.page);
  const total        = useNotificationsStore((s) => s.total);
  const perPage      = useNotificationsStore((s) => s.perPage);
  const unreadCount  = useNotificationsStore((s) => s.unreadCount);

  const fetchItems     = useNotificationsStore((s) => s.fetchItems);
  const setStatusLocal = useNotificationsStore((s) => s.setStatusLocal);
  const setPageLocal   = useNotificationsStore((s) => s.setPageLocal);

  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const markAsRead    = useNotificationsStore((s) => s.markAsRead);
  const destroy       = useNotificationsStore((s) => s.destroy);

  /**
   * Efecto de carga inicial al montar componente.
   *
   * Solo carga si el usuario tiene permiso para ver notificaciones.
   * Sin permiso, la llamada fallaría con 403 en el backend.
   * Ejecuta una sola vez (array vacío de dependencias).
   */
  useEffect(() => {
    if (canView) {
      useNotificationsStore.getState().fetchItems({ status: "all", page: 1 });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Handler de cambio de filtro por estado.
   *
   * @param {string} nextStatus - Nuevo filtro ("all", "unread", "read")
   *
   * Secuencia:
   * 1. Actualiza estado local de filtro
   * 2. Resetea a página 1
   * 3. Recarga datos con nuevo filtro
   */
  const handleStatusChange = (nextStatus) => {
    setStatusLocal(nextStatus);
    fetchItems({ status: nextStatus, page: 1 });
  };

  /**
   * Handler de cambio de página en paginador.
   *
   * @param {number} nextPage - Nueva página solicitada
   *
   * Mantiene filtro actual, solo cambia página:
   * 1. Actualiza estado local de página
   * 2. Recarga datos manteniendo status
   */
  const handlePageChange = (nextPage) => {
    setPageLocal(nextPage);
    fetchItems({ status, page: nextPage });
  };

  // Si no tiene permiso para ver notificaciones, muestra mensaje informativo
  if (!canView) {
    return (
      <div className="notifications-page">
        <p className="notifications-page__no-permission">
          No tienes permiso para ver las notificaciones.
        </p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      {/* Toolbar superior con filtros y acciones masivas.
          onMarkAllAsRead solo se pasa si tiene permiso, de lo contrario
          el toolbar puede ocultar el botón cuando recibe undefined */}
      <NotificationsToolbar
        status={status}
        unreadCount={unreadCount}
        onStatusChange={handleStatusChange}
        onMarkAllAsRead={canMarkAll ? markAllAsRead : undefined}
      />

      {/* Contenido principal: lista de notificaciones.
          onMarkAsRead y onDelete se pasan condicionalmente según permisos
          para que NotificationsList oculte los botones correspondientes */}
      <div className="notifications-page__content">
        <NotificationsList
          items={items}
          loading={loadingItems}
          onMarkAsRead={canMarkAsRead ? markAsRead : undefined}
          onDelete={canDelete ? destroy : undefined}
        />
      </div>

      {/* Footer con paginador */}
      <div className="notifications-page__footer">
        <Paginator
          page={page}
          total={total}
          perPage={perPage}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}