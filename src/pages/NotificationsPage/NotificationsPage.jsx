// Importaciones de React
import { useEffect } from "react";

// Store de Zustand para gestión global de notificaciones
import { useNotificationsStore } from "../../stores/notificationsStore";

// Componentes específicos de notificaciones
import Paginator from "../../components/Paginator/Paginator";
import NotificationsToolbar from "../../components/NotificationsToolbar/NotificationsToolbar";
import NotificationsList from "../../components/NotificationsList/NotificationsList";

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
 * - Acciones masivas: Marcar todas como leídas
 * - Estados de carga diferenciados por operación
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
  const items = useNotificationsStore((s) => s.items);
  const loadingItems = useNotificationsStore((s) => s.loadingItems);
  const status = useNotificationsStore((s) => s.status);
  const page = useNotificationsStore((s) => s.page);
  const total = useNotificationsStore((s) => s.total);
  const perPage = useNotificationsStore((s) => s.perPage);
  const unreadCount = useNotificationsStore((s) => s.unreadCount);

  const fetchItems = useNotificationsStore((s) => s.fetchItems);
  const setStatusLocal = useNotificationsStore((s) => s.setStatusLocal);
  const setPageLocal = useNotificationsStore((s) => s.setPageLocal);

  const markAllAsRead = useNotificationsStore((s) => s.markAllAsRead);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);
  const destroy = useNotificationsStore((s) => s.destroy);

  /**
   * Efecto de carga inicial al montar componente.
   * 
   * Carga primera página de todas las notificaciones.
   * Ejecuta una sola vez (array vacío de dependencias).
   */
  useEffect(() => {
    useNotificationsStore.getState().fetchItems({ status: "all", page: 1 });
  }, []);

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

  return (
    <div className="notifications-page">
      {/* Toolbar superior con filtros y acciones masivas */}
      <NotificationsToolbar
        status={status}
        unreadCount={unreadCount}
        onStatusChange={handleStatusChange}
        onMarkAllAsRead={markAllAsRead}
      />

      {/* Contenido principal: lista de notificaciones */}
      <div className="notifications-page__content">
        <NotificationsList
          items={items}
          loading={loadingItems}
          onMarkAsRead={markAsRead}
          onDelete={destroy}
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
