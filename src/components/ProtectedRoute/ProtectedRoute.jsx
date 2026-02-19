// Importa componentes y hooks de react-router-dom
import { Navigate, Outlet, useLocation } from "react-router-dom";

// Importa utilidad para verificar autenticación
import { isAuth } from "../../utils/auth";

/**
 * Componente de ruta protegida con autenticación y autorización.
 * 
 * Protege rutas que requieren:
 * 1. Usuario autenticado (logged in)
 * 2. Permisos específicos (opcional)
 * 
 * Comportamiento:
 * - Si NO está autenticado → redirige a /login
 * - Si está autenticado pero NO autorizado → redirige a /unauthorized
 * - Si está autenticado Y autorizado → renderiza las rutas hijas (Outlet)
 * 
 * Preserva la ubicación original en el state para redirección post-login.
 * 
 * @component
 * 
 * @param {Object} props - Propiedades del componente
 * @param {boolean} [props.isAllowed=true] - Si el usuario tiene permisos necesarios
 * @param {string} [props.redirectTo="/login"] - Ruta de redirección si no autenticado
 * 
 * @returns {JSX.Element} Navigate (redirección) u Outlet (rutas hijas)
 * 
 * @example
 * // En configuración de rutas - protege todas las rutas administrativas
 * <Route element={<ProtectedRoute />}>
 *   <Route path="/admin/users" element={<UsersPage />} />
 *   <Route path="/admin/settings" element={<SettingsPage />} />
 * </Route>
 * 
 * @example
 * // Ruta protegida con validación de permisos
 * <Route 
 *   element={
 *     <ProtectedRoute 
 *       isAllowed={hasPermission('users.create')} 
 *     />
 *   }
 * >
 *   <Route path="/users/create" element={<CreateUserPage />} />
 * </Route>
 * 
 * @example
 * // Múltiples niveles de protección
 * <Routes>
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *     
 *     <Route element={<ProtectedRoute isAllowed={isAdmin} />}>
 *       <Route path="/admin" element={<AdminPanel />} />
 *     </Route>
 *   </Route>
 * </Routes>
 */
export default function ProtectedRoute({redirectTo = "/login"}) {
  
  // Hook para obtener la ubicación actual (pathname, search, hash, state)
  const location = useLocation();

  // Verificación 1: ¿El usuario está autenticado?
  if (!isAuth()) {
    // No autenticado → redirige a login
    return (
      <Navigate
        to={redirectTo}
        replace // Reemplaza la entrada actual del historial (no crea nueva)
        // Guarda la ubicación original en el state para redirección post-login
        // Ejemplo: después de login, puede redirigir a la ruta que intentaba acceder
        state={{ from: location.pathname }}
      />
    );
  }

  // Usuario autenticado Y autorizado → renderiza las rutas hijas
  // Outlet es un componente especial de react-router que renderiza
  // las rutas hijas definidas en la configuración
  return <Outlet />;
}