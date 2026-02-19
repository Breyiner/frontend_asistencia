// Importa useState de React
import { useState } from "react";

// Importa utilidades de autenticación
import { getUser, setCurrentRole, getCurrentRole } from "../../utils/auth";

// Importa estilos del selector de rol
import "./RoleSelector.css";
import { useNavigate } from "react-router-dom";

/**
 * Componente selector de rol con dropdown.
 * 
 * Permite a usuarios con múltiples roles cambiar entre ellos.
 * Al cambiar de rol, **redirige al dashboard** para aplicar los nuevos permisos.
 * 
 * Características:
 * - Muestra rol actual en el botón principal
 * - Dropdown con lista de todos los roles disponibles
 * - Redirección automática al dashboard al cambiar de rol ← MODIFICADO
 * - Se oculta si el usuario no tiene roles o solo tiene uno
 * 
 * Flujo:
 * 1. Usuario hace click en el botón con el rol actual
 * 2. Se despliega dropdown con opciones de roles
 * 3. Usuario selecciona un rol
 * 4. Se actualiza en localStorage/sessionStorage
 * 5. **Redirige a /dashboard** con navigate() ← CAMBIADO
 * 
 * @component
 * 
 * @returns {JSX.Element|null} Selector de rol o null si no aplica
 */
export default function RoleSelector() {
  const navigate = useNavigate();
  
  // Estado para controlar apertura/cierre del dropdown
  const [open, setOpen] = useState(false);
  
  // Obtiene información del usuario autenticado
  const user = getUser();

  /**
   * Cambia el rol activo y **redirige al dashboard**.
   * 
   * @param {number} roleId - ID del rol a activar
   */
  const switchRole = (roleId) => {
    // Establece el nuevo rol actual en el almacenamiento
    setCurrentRole(roleId);
    
    // Cierra el dropdown
    setOpen(false);
    
    // Redirige al dashboard en lugar de reload()
    navigate("/home", { replace: true }); // replace=true evita historial duplicado
  };

  // Si el usuario no tiene roles, no muestra el selector
  if (!user?.roles?.length) return null;

  return (
    // Contenedor principal del selector
    <div className="role-selector">
      
      {/* Botón que muestra el rol actual y abre/cierra el dropdown */}
      <button 
        onClick={() => setOpen(!open)}
        className="role-selector__current"
      >
        {/* Muestra el nombre del rol actual o "Rol" como fallback */}
        {getCurrentRole()?.name || 'Rol'}
      </button>
      
      {/* Dropdown con lista de roles - solo visible si open es true */}
      {open && (
        <div className="role-selector__dropdown">
          
          {/* Mapea cada rol del usuario a un botón */}
          {user.roles.map(role => (
            <button 
              key={role.id}
              onClick={() => switchRole(role.id)}
              className="role-selector__option"
            >
              {/* Nombre del rol */}
              {role.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
