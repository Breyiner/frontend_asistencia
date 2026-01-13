import { NavLink } from "react-router-dom";
import { getUser, getCurrentRole } from "../../utils/auth";
import "./UserProfile.css";

export default function UserProfile() {
  const user = getUser();
  const currentRole = getCurrentRole();
  
  const initials = user.name 
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)
    : '??';

  return (
    <NavLink 
      to="/profile" 
      className={({ isActive }) => `user-profile ${isActive ? 'user-profile--active' : ''}`}
    >
      <div className="user-profile__avatar">{initials}</div>
      <div className="user-profile__info">
        <div className="user-profile__name">{user?.name || 'Usuario'}</div>
        <div className="user-profile__role">{currentRole?.name || 'Cargando...'}</div>
      </div>
    </NavLink>
  );
}