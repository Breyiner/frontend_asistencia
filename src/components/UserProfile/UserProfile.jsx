import { NavLink } from "react-router-dom";
import "./UserProfile.css";

export default function UserProfile() {
  return (
    <NavLink 
      to="/profile" 
      className={({ isActive }) => 
        `user-profile ${isActive ? 'user-profile--active' : ''}`
      }
    >
      <div className="user-profile__avatar">PR</div>
      <div className="user-profile__info">
        <div className="user-profile__name">Pedro Ramírez</div>
        <div className="user-profile__role">Admin</div>
      </div>
    </NavLink>
  );

}