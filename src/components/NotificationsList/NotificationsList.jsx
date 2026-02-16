// Importa componente de item individual de notificación
import NotificationsItem from "../NotificationsItem/NotificationsItem";

// Importa estilos de la lista de notificaciones
import "./NotificationsList.css";

/**
 * Componente de lista de notificaciones.
 * 
 * Renderiza una lista de notificaciones con estados de:
 * - Carga: muestra mensaje "Cargando..."
 * - Vacío: muestra mensaje "No tienes notificaciones"
 * - Con datos: lista de NotificationsItem
 * 
 * Maneja la delegación de eventos hacia el componente padre
 * para marcar como leídas y eliminar notificaciones.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Array<Object>} props.items - Array de notificaciones a mostrar
 * @param {boolean} props.loading - Indica si está cargando
 * @param {Function} props.onMarkAsRead - Callback para marcar notificación como leída
 * @param {Function} props.onDelete - Callback para eliminar notificación
 * 
 * @returns {JSX.Element} Lista de notificaciones o mensaje de estado
 * 
 * @example
 * <NotificationsList
 *   items={notifications}
 *   loading={isLoading}
 *   onMarkAsRead={(id) => handleMarkAsRead(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */
export default function NotificationsList({ items, loading, onMarkAsRead, onDelete }) {
  
  // Estado de carga
  if (loading) {
    return <div className="notifications-list__state">Cargando...</div>;
  }

  // Estado vacío - no hay notificaciones
  // Verifica tanto que items existe como que tiene elementos
  if (!items?.length) {
    return <div className="notifications-list__state">No tienes notificaciones</div>;
  }

  // Estado con datos - renderiza la lista
  return (
    <div className="notifications-list">
      {/* Mapea cada notificación a un NotificationsItem */}
      {items.map((n) => (
        <NotificationsItem
          key={n.id}
          notification={n}
          // Pasa las callbacks hacia abajo
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}