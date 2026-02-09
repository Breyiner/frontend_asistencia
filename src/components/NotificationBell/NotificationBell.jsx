import React, { useEffect, useRef, useState } from "react";
import { RiNotificationLine } from "@remixicon/react";
import "./NotificationBell.css";
import { useNotificationsStore } from "../../stores/notificationsStore";

function NotificationBell() {
  const unreadCount = useNotificationsStore((s) => s.unreadCount);
  const latest = useNotificationsStore((s) => s.latest);
  const loadingLatest = useNotificationsStore((s) => s.loadingLatest);
  const fetchLatest = useNotificationsStore((s) => s.fetchLatest);
  const markAsRead = useNotificationsStore((s) => s.markAsRead);

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenPopover = async () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) await fetchLatest();
  };

  return (
    <div className="notification-bell-container" ref={popoverRef}>
      <button onClick={handleOpenPopover} className="notification-bell-button" aria-label="Notificaciones">
        <RiNotificationLine className="notification-bell-icon" />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notification-popover">
          <div className="notification-popover-header">
            <h3>Notificaciones</h3>
            <button onClick={() => setIsOpen(false)} className="notification-popover-close">×</button>
          </div>

          <div className="notification-popover-body">
            {loadingLatest ? (
              <p>Cargando...</p>
            ) : latest.length === 0 ? (
              <p className="notification-empty">No tienes notificaciones</p>
            ) : (
              <ul className="notification-list">
                {latest.map((n) => {
                  const isUnread = !n.read_at;
                  return (
                    <li
                      key={n.id}
                      className={`notification-item ${isUnread ? "is-unread" : "is-read"}`}
                      onClick={() => isUnread && markAsRead(n.id)}
                      role="button"
                      tabIndex={0}
                    >
                      <h4 className="notification-title">{n.title}</h4>
                      <p className="notification-content">{n.content}</p>
                      <small className="notification-time">
                        {n.created_at_human || new Date(n.created_at).toLocaleString()}
                      </small>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="notification-popover-footer">
            <a href="/notifications" className="notification-see-all">Ver todas</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
