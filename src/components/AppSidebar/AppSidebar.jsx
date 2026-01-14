import { NavLink } from "react-router-dom";
import UserProfile from "../UserProfile/UserProfile";
import { useAuthMenu } from "../../hooks/useAuthMenu";
import "./AppSidebar.css";

export default function AppSidebar() {
  const menuItems = useAuthMenu();

  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo">
          <img src="/logo_sena_white.png" alt="Logo SENA" />
        </div>
        <span className="app-sidebar__title">Asistencia SENA</span>
      </div>

      <nav className="app-sidebar__nav">
        {menuItems.map(item => (
          <NavLink 
            key={item.to}
            to={item.to} 
            className={({ isActive }) => 
              `app-sidebar__item ${isActive ? 'app-sidebar__item--active' : ''}`
            }
          >
            <item.icon className="app-sidebar__icon" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <UserProfile />
    </aside>
  );
}