// Importa iconos de Remix Icon
import { RiCheckLine, RiDeleteBinLine, RiTimeLine } from "@remixicon/react";

// Importa estilos del item de notificación
import "./NotificationsItem.css";

// Importa componente de botón de acción con icono
import IconActionButton from "../IconActionButton/IconActionButton";

/**
 * Componente de item individual de notificación.
 * 
 * Renderiza una notificación con:
 * - Indicador visual de no leída (punto azul)
 * - Título y contenido
 * - Timestamp con icono de reloj
 * - Botones de acción: marcar como leída y eliminar
 * 
 * Características:
 * - Estilo diferente para notificaciones leídas/no leídas
 * - Botón de "marcar como leída" deshabilitado si ya está leída
 * - Formato de fecha humanizado o timestamp
 * - Acciones claramente identificadas con iconos y tooltips
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.notification - Objeto de notificación
 * @param {number} props.notification.id - ID único de la notificación
 * @param {string} props.notification.title - Título de la notificación
 * @param {string} props.notification.content - Contenido/mensaje
 * @param {string|null} props.notification.read_at - Timestamp de lectura (null si no leída)
 * @param {string} props.notification.created_at - Timestamp de creación
 * @param {string} [props.notification.created_at_human] - Fecha humanizada (ej: "hace 2 horas")
 * @param {Function} props.onMarkAsRead - Callback para marcar como leída
 * @param {Function} props.onDelete - Callback para eliminar
 * 
 * @returns {JSX.Element} Item de notificación con acciones
 * 
 * @example
 * <NotificationsItem
 *   notification={{
 *     id: 123,
 *     title: "Nueva asignación",
 *     content: "Se te ha asignado a la ficha 2558971",
 *     read_at: null,
 *     created_at: "2024-01-15T10:30:00Z",
 *     created_at_human: "hace 2 horas"
 *   }}
 *   onMarkAsRead={(id) => handleMarkAsRead(id)}
 *   onDelete={(id) => handleDelete(id)}
 * />
 */
export default function NotificationsItem({ notification, onMarkAsRead, onDelete }) {
  
  // Determina si la notificación no ha sido leída
  // Si read_at es null, significa que no está leída
  const isUnread = !notification.read_at;

  return (
    // Contenedor del item con clase dinámica según estado de lectura
    <div className={`notifications-item ${isUnread ? "notifications-item--unread" : ""}`}>
      
      {/* Cuerpo del item con contenido de la notificación */}
      <div className="notifications-item__body">
        
        {/* Título con indicador de no leída */}
        <div className="notifications-item__title">
          {notification.title}
          
          {/* Punto azul indicador - solo si no está leída
              Renderizado condicional con && */}
          {isUnread && <span className="notifications-item__dot" />}
        </div>

        {/* Contenido/mensaje de la notificación */}
        <div className="notifications-item__content">
          {notification.content}
        </div>

        {/* Timestamp con icono de reloj */}
        <div className="notifications-item__time">
          <RiTimeLine size={13} /> 
          {/* Muestra fecha humanizada del servidor o formatea la fecha
              created_at_human: "hace 2 horas"
              toLocaleString(): "15/01/2024, 10:30:00" */}
          {notification.created_at_human || new Date(notification.created_at).toLocaleString()}
        </div>
      </div>

      {/* Contenedor de botones de acción */}
      <div className="notifications-item__actions">

        {/* Botón de marcar como leída */}
        <IconActionButton
          key="edit"
          title="Marcar como leída"
          onClick={() => onMarkAsRead(notification.id)}
          color="#007832" // Verde
          // Deshabilita si ya está leída (no tiene sentido marcar como leída si ya lo está)
          disabled={!isUnread}
        >
          <RiCheckLine size={19} />
        </IconActionButton>

        {/* Botón de eliminar */}
        <IconActionButton
          key="delete"
          title="Eliminar"
          onClick={() => onDelete(notification.id)}
          className="icon-action-btn--danger"
          color="#ef4444" // Rojo
        >
          <RiDeleteBinLine size={19} />
        </IconActionButton>
      </div>
    </div>
  );
}