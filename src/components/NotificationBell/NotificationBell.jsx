// Importa hooks de React
import React, { useEffect, useRef, useState } from "react";

// Importa icono de notificación de Remix Icon
import { RiNotificationLine } from "@remixicon/react";

// Importa estilos de la campana de notificaciones
import "./NotificationBell.css";

// Importa store de Zustand para gestión de estado de notificaciones
import { useNotificationsStore } from "../../stores/notificationsStore";

// Importa la utilidad de verificación de permisos Spatie
// Permite mostrar/ocultar acciones según los permisos del usuario autenticado
import { can } from "../../utils/auth";

/**
 * Componente de campana de notificaciones con popover.
 *
 * Muestra:
 * - Icono de campana clickeable
 * - Badge con cantidad de notificaciones no leídas
 * - Popover con lista de notificaciones recientes
 * - Estados de carga y vacío
 * - Funcionalidad de marcar como leída al hacer click
 *
 * Características:
 * - Cierre automático al hacer click fuera (useRef + event listener)
 * - Carga de notificaciones al abrir el popover
 * - Sincronización con store de Zustand
 * - Formato de fecha legible
 * - Indicador visual de no leídas
 * - Enlace a página completa de notificaciones
 *
 * Permisos Spatie utilizados:
 * - notifications.viewAny:   cargar latest y unread_count (campana y badge)
 * - notifications.markAsRead: marcar una notificación individual como leída
 *
 * @component
 *
 * @returns {JSX.Element} Campana de notificaciones con popover
 *
 * @example
 * // Uso en header de la aplicación
 * <header>
 *   <Logo />
 *   <NotificationBell />
 *   <UserProfile />
 * </header>
 */
function NotificationBell() {

  // Selecciona estado del store de notificaciones usando Zustand
  // Solo se re-renderiza si estos valores específicos cambian
  const unreadCount    = useNotificationsStore((s) => s.unreadCount);
  const latest         = useNotificationsStore((s) => s.latest);
  const loadingLatest  = useNotificationsStore((s) => s.loadingLatest);

  // Selecciona acciones del store
  const fetchLatest = useNotificationsStore((s) => s.fetchLatest);
  const markAsRead  = useNotificationsStore((s) => s.markAsRead);

  /**
   * Verificaciones de permisos Spatie.
   *
   * canViewNotifications: habilita carga de latest y muestra del badge
   *   → protege GET /notifications/latest y GET /notifications/unread_count
   *
   * canMarkAsRead: habilita marcar una notificación individual como leída
   *   → protege PATCH /notifications/{id}/read
   */
  const canViewNotifications = can("notifications.viewAny");
  const canMarkAsRead        = can("notifications.markAsRead");

  // Estado local para controlar apertura/cierre del popover
  const [isOpen, setIsOpen] = useState(false);

  // Referencia al contenedor del popover para detectar clicks fuera
  const popoverRef = useRef(null);

  /**
   * Efecto para cerrar el popover al hacer click fuera.
   *
   * Agrega event listener al documento que detecta clicks.
   * Si el click es fuera del popover, lo cierra.
   *
   * Cleanup: remueve el event listener al desmontar.
   */
  useEffect(() => {
    /**
     * Maneja clicks en cualquier parte del documento.
     *
     * @param {MouseEvent} event - Evento de click
     */
    function handleClickOutside(event) {
      // Si el click fue fuera del popover (ref no contiene el target)
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    // Agrega listener al documento
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup: remueve listener al desmontar
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []); // Array vacío = solo al montar/desmontar

  /**
   * Maneja apertura/cierre del popover.
   *
   * Al abrir, carga las notificaciones más recientes
   * solo si el usuario tiene permiso para verlas.
   *
   * @async
   */
  const handleOpenPopover = async () => {
    // Alterna estado de apertura
    setIsOpen((prev) => !prev);

    // Si se está abriendo y tiene permiso, carga las notificaciones recientes
    // Sin permiso la llamada a fetchLatest fallaría con 403 en el backend
    if (!isOpen && canViewNotifications) await fetchLatest();
  };

  return (
    // Contenedor principal con referencia para detectar clicks fuera
    <div className="notification-bell-container" ref={popoverRef}>

      {/* Botón de la campana */}
      <button
        onClick={handleOpenPopover}
        className="notification-bell-button"
        aria-label="Notificaciones"
      >
        {/* Icono de campana */}
        <RiNotificationLine className="notification-bell-icon" />

        {/* Badge con cantidad de no leídas - solo si hay no leídas y tiene permiso
            Sin permiso el unreadCount no se carga, así que no se muestra */}
        {canViewNotifications && unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Popover con lista de notificaciones - solo visible si isOpen es true
          Renderizado condicional con && */}
      {isOpen && (
        <div className="notification-popover">

          {/* Header del popover con título y botón de cerrar */}
          <div className="notification-popover-header">
            <h3>Notificaciones</h3>

            {/* Botón de cerrar (×) */}
            <button
              onClick={() => setIsOpen(false)}
              className="notification-popover-close"
            >
              ×
            </button>
          </div>

          {/* Cuerpo del popover con lista o mensajes de estado */}
          <div className="notification-popover-body">

            {/* Si no tiene permiso para ver notificaciones, muestra mensaje informativo */}
            {!canViewNotifications ? (
              <p className="notification-empty">No tienes permiso para ver notificaciones</p>

            ) : loadingLatest ? (
              /* Estado de carga mientras se obtienen las notificaciones */
              <p>Cargando...</p>

            ) : latest.length === 0 ? (
              /* Estado vacío - no hay notificaciones */
              <p className="notification-empty">No tienes notificaciones</p>

            ) : (
              /* Lista de notificaciones */
              <ul className="notification-list">

                {/* Mapea cada notificación */}
                {latest.map((n) => {
                  // Determina si la notificación no ha sido leída
                  const isUnread = !n.read_at;

                  // El click para marcar como leída solo está disponible si:
                  // 1. La notificación no fue leída aún
                  // 2. El usuario tiene permiso notifications.markAsRead
                  const handleClick = isUnread && canMarkAsRead
                    ? () => markAsRead(n.id)
                    : undefined;

                  return (
                    // Item de notificación
                    // Clase dinámica según estado de lectura
                    <li
                      key={n.id}
                      className={`notification-item ${isUnread ? "is-unread" : "is-read"}`}
                      onClick={handleClick}
                      // Solo es interactivo (role=button) si puede marcar como leída
                      role={handleClick ? "button" : undefined}
                      // Solo es tabulable si tiene acción disponible
                      tabIndex={handleClick ? 0 : undefined}
                    >
                      {/* Título de la notificación */}
                      <h4 className="notification-title">{n.title}</h4>

                      {/* Contenido/mensaje de la notificación */}
                      <p className="notification-content">{n.content}</p>

                      {/* Timestamp humanizado o fecha formateada
                          Usa formato humanizado del servidor si existe,
                          sino formatea la fecha con toLocaleString() */}
                      <small className="notification-time">
                        {n.created_at_human || new Date(n.created_at).toLocaleString()}
                      </small>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer del popover con enlace a página completa
              Solo visible si tiene permiso para ver notificaciones */}
          {canViewNotifications && (
            <div className="notification-popover-footer">
              {/* Enlace a página de notificaciones completa
                  Usa <a> en lugar de Link porque puede estar fuera del router */}
              <a href="/notifications" className="notification-see-all">
                Ver todas
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;