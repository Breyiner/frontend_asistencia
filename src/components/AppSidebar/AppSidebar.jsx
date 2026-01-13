import { NavLink } from "react-router-dom";
import { RiDashboardLine, RiUser3Line } from "@remixicon/react";
import "./AppSidebar.css";
import UserProfile from "../UserProfile/UserProfile";

export default function AppSidebar() {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar__brand">
        <div className="app-sidebar__logo">
          <img src="/logo_sena_white.png" alt="Logo SENA" />
        </div>
        <span className="app-sidebar__title">
          Asistencia <br></br>SENA
        </span>
      </div>

      <nav className="app-sidebar__nav">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `app-sidebar__item ${isActive ? "app-sidebar__item--active" : ""}`
          }
        >
          <RiDashboardLine className="app-sidebar__icon" />
          Dashboard
        </NavLink>

        <NavLink
          to="/users"
          className={({ isActive }) =>
            `app-sidebar__item ${isActive ? "app-sidebar__item--active" : ""}`
          }
        >
          <RiUser3Line className="app-sidebar__icon" />
          <span>Usuarios</span>
        </NavLink>
      </nav>

      <UserProfile />
    </aside>
  );
}
