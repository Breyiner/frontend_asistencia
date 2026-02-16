// Importa componente Button
import Button from "../Button/Button";

// Importa estilos de la barra de herramientas de notificaciones
import "./NotificationsToolbar.css";

/**
 * Barra de herramientas para filtrar y gestionar notificaciones.
 * 
 * Proporciona:
 * - Pestañas de filtro: Todas, Leídas, No leídas (con contador)
 * - Botón de acción: Marcar todas como leídas
 * 
 * Las pestañas cambian de estilo según el filtro activo.
 * El contador de no leídas se muestra en la pestaña correspondiente.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.status - Estado actual del filtro ("all", "read", "unread")
 * @param {number} props.unreadCount - Cantidad de notificaciones no leídas
 * @param {Function} props.onStatusChange - Callback al cambiar filtro
 * @param {Function} props.onMarkAllAsRead - Callback para marcar todas como leídas
 * 
 * @returns {JSX.Element} Barra de herramientas con pestañas y acciones
 * 
 * @example
 * <NotificationsToolbar
 *   status="unread"
 *   unreadCount={5}
 *   onStatusChange={(status) => setFilter(status)}
 *   onMarkAllAsRead={handleMarkAllAsRead}
 * />
 */
export default function NotificationsToolbar({
    status,
    unreadCount,
    onStatusChange,
    onMarkAllAsRead,
}) {
    return (
        // Contenedor principal de la barra
        <div className="notifications-toolbar">
            
            {/* Contenedor de pestañas de filtro */}
            <div className="notifications-toolbar__tabs">
                
                {/* Pestaña "Todas" */}
                <Button
                    type="button"
                    // Variante dinámica: "primary" si está activa, "ghost" si no
                    variant={status === "all" ? "primary" : "ghost"}
                    onClick={() => onStatusChange("all")}
                >
                    Todas
                </Button>

                {/* Pestaña "Leídas" */}
                <Button
                    type="button"
                    variant={status === "read" ? "primary" : "ghost"}
                    onClick={() => onStatusChange("read")}
                >
                    Leídas
                </Button>

                {/* Pestaña "No leídas" con contador */}
                <Button
                    type="button"
                    variant={status === "unread" ? "primary" : "ghost"}
                    onClick={() => onStatusChange("unread")}
                >
                    {/* Muestra cantidad de no leídas entre paréntesis */}
                    No leídas ({unreadCount})
                </Button>
            </div>

            {/* Botón de acción global: marcar todas como leídas */}
            <Button
                type="button"
                variant="secondary"
                onClick={onMarkAllAsRead}
            >
                Marcar todas como leídas
            </Button>
        </div>
    );
}