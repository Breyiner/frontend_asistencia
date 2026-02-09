import NotificationsItem from "../NotificationsItem/NotificationsItem";
import "./NotificationsList.css";

export default function NotificationsList({ items, loading, onMarkAsRead, onDelete }) {
  if (loading) {
    return <div className="notifications-list__state">Cargando...</div>;
  }

  if (!items?.length) {
    return <div className="notifications-list__state">No tienes notificaciones</div>;
  }

  return (
    <div className="notifications-list">
      {items.map((n) => (
        <NotificationsItem
          key={n.id}
          notification={n}
          onMarkAsRead={onMarkAsRead}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
