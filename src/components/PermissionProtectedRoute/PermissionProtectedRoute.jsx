import { Navigate } from "react-router-dom";
import { can, getUser } from "../../utils/auth";

/**
 * ProtectedRoute con validación de permisos específicos (.viewAny)
 * 
 * Soporta string ÚNICO o ARRAY de permisos:
 * - "users.viewAny"
 * - ["users.viewAny", "users.viewAny", "fichas.viewAny"]
 * 
 * Verifica:
 * 1. Autenticación (token válido)
 * 2. AL MENOS UN permiso válido
 * 3. Si falla → redirige a /unauthorized
 */
const PermissionProtectedRoute = ({ children, permission }) => {
  // 1. Verifica autenticación básica
  if (!getUser()) {
    return <Navigate to="/login" replace />;
  }

  // 2. Normaliza permiso: string → array
  const permissions = Array.isArray(permission) ? permission : [permission];

  // 3. Verifica AL MENOS UN permiso válido
  const hasAnyPermission = permissions.some(p => can(p));

  if (!hasAnyPermission) {
    return <Navigate to="/unauthorized" replace />;
  }

  // 4. Renderiza hijos si todo OK
  return children;
};

export default PermissionProtectedRoute;