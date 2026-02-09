import Button from "../Button/Button";
import "./NotificationsToolbar.css";

export default function NotificationsToolbar({
    status,
    unreadCount,
    onStatusChange,
    onMarkAllAsRead,
}) {
    return (
        <div className="notifications-toolbar">
            <div className="notifications-toolbar__tabs">
                <Button
                    type="button"
                    variant={status === "all" ? "primary" : "ghost"}
                    onClick={() => onStatusChange("all")}
                >
                    Todas
                </Button>

                <Button
                    type="button"
                    variant={status === "read" ? "primary" : "ghost"}
                    onClick={() => onStatusChange("read")}
                >
                    Leídas
                </Button>

                <Button
                    type="button"
                    variant={status === "unread" ? "primary" : "ghost"}
                    onClick={() => onStatusChange("unread")}
                >
                    No leídas ({unreadCount})
                </Button>
            </div>

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
