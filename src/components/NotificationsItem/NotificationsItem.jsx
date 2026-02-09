import { RiCheckLine, RiDeleteBinLine, RiTimeLine } from "@remixicon/react";
import "./NotificationsItem.css";
import IconActionButton from "../IconActionButton/IconActionButton";


export default function NotificationsItem({ notification, onMarkAsRead, onDelete }) {
    const isUnread = !notification.read_at;

    return (
        <div className={`notifications-item ${isUnread ? "notifications-item--unread" : ""}`}>
            <div className="notifications-item__body">
                <div className="notifications-item__title">
                    {notification.title}
                    {isUnread && <span className="notifications-item__dot" />}
                </div>

                <div className="notifications-item__content">{notification.content}</div>

                <div className="notifications-item__time">
                    <RiTimeLine size={13} /> {notification.created_at_human || new Date(notification.created_at).toLocaleString()}
                </div>
            </div>

            <div className="notifications-item__actions">

                <IconActionButton
                    key="edit"
                    title="Marcar como leída"
                    onClick={() => onMarkAsRead(notification.id)}
                    color="#007832"
                    disabled={!isUnread}
                >
                    <RiCheckLine size={19} />
                </IconActionButton>

                <IconActionButton
                    key="delete"
                    title="Eliminar"
                    onClick={() => onDelete(notification.id)}
                    className="icon-action-btn--danger"
                    color="#ef4444"
                >
                    <RiDeleteBinLine size={19} />
                </IconActionButton>
            </div>
        </div>
    );
}
