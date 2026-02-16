// Importa utilidades de react-router-dom
import { matchPath, Outlet, useLocation } from "react-router-dom";

// Importa componentes del layout principal
import AppHeader from "../../components/AppHeader/AppHeader";
import AppSidebar from "../../components/AppSidebar/AppSidebar";

// Importa estilos del layout
import "./AppLayout.css";

/**
 * Mapeo de rutas a títulos de página.
 * 
 * Define el título que se muestra en el AppHeader según la ruta actual.
 * Usa patrones de react-router para rutas dinámicas (con :id).
 * 
 * Estructura de clave: patrón de ruta (puede incluir parámetros dinámicos)
 * Estructura de valor: título legible para mostrar al usuario
 * 
 * Nota: Las rutas se evalúan con matchPath, por lo que los parámetros
 * dinámicos (:id) funcionan correctamente.
 * 
 * @constant
 * @type {Object.<string, string>}
 */
const pageTitles = {
  // Páginas principales
  "/home": "Dashboard",
  
  // Usuarios
  "/users": "Usuarios",
  "/users/create": "Crear Usuario",
  "/users/:id": "Detalle de Usuario",
  
  // Aprendices
  "/apprentices": "Aprendices",
  "/apprentices/create": "Crear Aprendiz",
  "/apprentices/:id": "Detalle de Aprendiz",
  
  // Programas de formación
  "/training_programs": "Programas de Formación",
  "/training_programs/create": "Crear Programa de Formación",
  "/training_programs/:id": "Detalle de Programa de Formación",
  
  // Fichas
  "/fichas": "Fichas",
  "/fichas/create": "Crear Ficha",
  "/fichas/:id": "Detalle de Ficha",
  "/fichas/:id/attendances": "Asistencias de la Ficha",
  
  // Trimestres de fichas (rutas anidadas complejas)
  "/fichas/:id/ficha_terms/create": "Asociar Trimestre a Ficha",
  "/fichas/:id/ficha_terms/:id/update": "Editar Trimestre de Ficha",
  "/fichas/:id/ficha_terms/:id/schedule": "Horario de Trimestre de Ficha",
  
  // Sesiones de horarios (rutas muy anidadas)
  "/fichas/:id/ficha_terms/:id/schedule/:id/session/create": "Crear Sesión Para Horario",
  "/fichas/:id/ficha_terms/:id/schedule/:id/session/:id/update": "Editar Sesión de Horario",
  
  // Clases reales
  "/real_classes": "Clases Reales",
  "/real_classes/create": "Crear Clase Real",
  "/real_classes/:id": "Detalle de Clase Real",
  "/real_classes/:id/attendances": "Asistencias de la Clase",
  
  // Días sin clase
  "/no_class_days": "Días sin Clase",
  "/no_class_days/create": "Crear Día sin Clase",
  "/no_class_days/:id": "Detalle Día sin Clase",
  
  // Notificaciones
  "/notifications": "Mis notificaciones",
  
  // Áreas
  "/areas": "Areas",
  "/areas/create": "Crear Area",
  "/areas/:id": "Detalle de Area",
  
  // Roles
  "/roles": "Roles",
  "/roles/:id": "Detalle de Rol",
  "/roles/create": "Crear Rol",
  
  // Perfil
  "/profile": "Perfil",
};

/**
 * Componente de layout principal de la aplicación.
 * 
 * Proporciona la estructura base para todas las páginas autenticadas:
 * - Sidebar izquierdo con navegación (AppSidebar)
 * - Header superior con título dinámico (AppHeader)
 * - Área de contenido principal donde se renderizan las rutas hijas (Outlet)
 * 
 * Funcionalidades clave:
 * - Detección automática de ruta actual para título dinámico
 * - Usa matchPath para coincidir rutas con parámetros dinámicos
 * - Layout responsive (maneja mobile/desktop mediante CSS)
 * 
 * Estructura visual:
 * ┌─────────────┬──────────────────────────┐
 * │             │     AppHeader (título)   │
 * │  AppSidebar ├──────────────────────────┤
 * │             │                          │
 * │             │   Outlet (contenido)     │
 * │             │                          │
 * └─────────────┴──────────────────────────┘
 * 
 * @component
 * @returns {JSX.Element} Layout completo con sidebar, header y área de contenido
 * 
 * @example
 * // Uso en configuración de rutas
 * <Routes>
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<AppLayout />}>
 *       <Route path="/home" element={<HomePage />} />
 *       <Route path="/users" element={<UsersPage />} />
 *       <Route path="/users/:id" element={<UserShowPage />} />
 *     </Route>
 *   </Route>
 * </Routes>
 */
export default function AppLayout() {

  /**
   * Hook para obtener la ubicación actual (pathname, search, hash, state).
   * Se usa para determinar qué título mostrar en el header.
   */
  const location = useLocation();
  
  /**
   * Determina el título de la página actual.
   * 
   * Proceso:
   * 1. Convierte pageTitles a array de [patrón, título]
   * 2. Busca el primer patrón que coincida con la ruta actual
   * 3. Usa matchPath para manejar rutas con parámetros dinámicos (:id)
   * 4. Si no encuentra coincidencia, usa "App" como título por defecto
   * 
   * matchPath options:
   * - path: patrón de ruta (puede incluir :id)
   * - end: true (debe coincidir exactamente, no solo el prefijo)
   * 
   * Ejemplos de coincidencias:
   * - /users → "Usuarios"
   * - /users/123 → "Detalle de Usuario" (coincide con /users/:id)
   * - /fichas/456/attendances → "Asistencias de la Ficha"
   * - /ruta-desconocida → "App" (fallback)
   */
  const title =
    Object.entries(pageTitles).find(([pattern]) =>
      // matchPath retorna objeto si coincide, null si no
      matchPath({ path: pattern, end: true }, location.pathname)
    )?.[1] ?? "App"; // Extrae el título ([1]) o usa "App" si no hay coincidencia

  return (
    // Contenedor principal del layout
    <div className="app-layout">
      
      {/* Sidebar de navegación (izquierda) */}
      <AppSidebar />
      
      {/* Contenedor principal (derecha) con header y contenido */}
      <div className="app-layout__main">
        
        {/* Header con título dinámico */}
        <AppHeader title={title} />
        
        {/* Área de contenido principal donde se renderizan las rutas hijas
            Outlet es un componente especial de react-router que renderiza
            el componente de la ruta hija que coincide con la URL actual */}
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}