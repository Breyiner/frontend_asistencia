import NotificationBell from "../NotificationBell/NotificationBell";
import RoleSelector from "../RoleSelector/RoleSelector";
import NotificationsBootstrapper from "../NotificationsBootstrapper/NotificationsBootstrapper";
import "./AppHeader.css";

export default function AppHeader({ title }) {
  return (
    <header className="app-header">
      <h1 className="app-header__title">{title}</h1>

      <div className="app-header__actions">
        <NotificationsBootstrapper />
        <NotificationBell />
        <RoleSelector />
      </div>
    </header>
  );
}
