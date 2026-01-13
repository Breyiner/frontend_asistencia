import { useState } from "react";
import { getUser, setCurrentRole, getCurrentRole } from "../../utils/auth";
import "./RoleSelector.css";

export default function RoleSelector() {
  const [open, setOpen] = useState(false);
  const user = getUser();

  const switchRole = (roleId) => {
    setCurrentRole(roleId);
    setOpen(false);
    window.location.reload();
  };

  if (!user?.roles?.length) return null;

  return (
    <div className="role-selector">
      <button 
        onClick={() => setOpen(!open)}
        className="role-selector__current"
      >
        {getCurrentRole().name || 'Rol'}
      </button>
      
      {open && (
        <div className="role-selector__dropdown">
          {user.roles.map(role => (
            <button 
              key={role.id}
              onClick={() => switchRole(role.id)}
              className="role-selector__option"
            >
              {role.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}