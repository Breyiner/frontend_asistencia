
import { Navigate } from "react-router-dom";
import { can, getUser } from "../../utils/auth";

/**ProtectedRoute con validación de permisos específicos (.viewAny)
 * 
 * Verifica:
 * 1. Autenticación (token válido)
 * 2. Permiso específico: `recurso.viewAny` (ej: "users.viewAny")
 * 3. Si falla permiso → redirige a /unauthorized
 */

const PermissionProtectedRoute = ({ children, permission }) => {
  // 1. Verifica autenticación básica
  if (!getUser()) {
    return <Navigate to="/login" replace />;
  }

  // 2. Verifica permiso específico (.viewAny)
  const hasPermission = can(permission); // ej: "users.viewAny", "fichas.viewAny"
  
  if (!hasPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 3. Renderiza hijos si todo OK
  return children;
};

export default PermissionProtectedRoute;