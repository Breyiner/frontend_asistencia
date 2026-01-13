import { NavLink } from "react-router-dom";
import "./AuthTabs.css";

export default function AuthTabs() {
  const cls = ({ isActive }) =>
    isActive ? "auth-tabs__btn auth-tabs__btn--active" : "auth-tabs__btn";

  return (
    <div className="auth-tabs">
      <NavLink to="/login" className={cls}>
        Iniciar Sesión
      </NavLink>

      <NavLink to="/register" className={cls}>
        Registro
      </NavLink>
    </div>
  );
}