// components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { getCurrentRoleCode, getUser } from "../../utils/auth";
import "./NotificationBell.css";
import { RiNotificationLine } from "@remixicon/react";

function NotificationBell() {
  const user = getUser();
  const actingRoleCode = getCurrentRoleCode(); // ajusta según cómo lo obtengas

  const {
    unreadCount,
    latest,
    loading,
    markAllAsRead,
  } = useNotifications(user?.id || null, actingRoleCode);

  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpenPopover = async () => {
    setIsOpen((prev) => !prev);

    await markAllAsRead();
  };

  return (
    <div className="notification-bell-container" ref={popoverRef}>
      <button
        onClick={handleOpenPopover}
        className="notification-bell-button"
        aria-label="Notificaciones"
      >
        <RiNotificationLine className="notification-bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-popover">
          <div className="notification-popover-header">
            <h3>Notificaciones</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="notification-popover-close"
            >
              ×
            </button>
          </div>
          <div className="notification-popover-body">
            {loading ? (
              <p>Cargando...</p>
            ) : latest.length === 0 ? (
              <p className="notification-empty">No tienes notificaciones</p>
            ) : (
              <ul className="notification-list">
                {latest.map((n) => (
                  <li key={n.id} className="notification-item">
                    <h4 className="notification-title">{n.title}</h4>
                    <p className="notification-content">{n.content}</p>
                    <small className="notification-time">
                      {n.created_at_human || new Date(n.created_at).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="notification-popover-footer">
            <a href="/notificaciones" className="notification-see-all">
              Ver todas
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;