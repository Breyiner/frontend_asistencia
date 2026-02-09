import { useEffect } from "react";
import { useNotificationsStore } from "../../stores/notificationsStore";
import Paginator from "../../components/Paginator/Paginator";
import NotificationsToolbar from "../../components/NotificationsToolbar/NotificationsToolbar";
import NotificationsList from "../../components/NotificationsList/NotificationsList";
import "./NotificationsPage.css";

export default function NotificationsPage() {
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

  useEffect(() => {
    useNotificationsStore.getState().fetchItems({ status: "all", page: 1 });
  }, []);

  const handleStatusChange = (nextStatus) => {
    setStatusLocal(nextStatus);

    fetchItems({ status: nextStatus, page: 1 });
  };

  const handlePageChange = (nextPage) => {
    setPageLocal(nextPage);

    fetchItems({ status, page: nextPage });
  };

  return (
    <div className="notifications-page">
      <NotificationsToolbar
        status={status}
        unreadCount={unreadCount}
        onStatusChange={handleStatusChange}
        onMarkAllAsRead={markAllAsRead}
      />

      <div className="notifications-page__content">
        <NotificationsList
          items={items}
          loading={loadingItems}
          onMarkAsRead={markAsRead}
          onDelete={destroy}
        />
      </div>

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