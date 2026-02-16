// Importa funciones de react-router-dom para crear rutas
import { createBrowserRouter, Navigate } from "react-router-dom";

// Importa páginas de autenticación
import LoginFormPage from "../pages/AuthPages/LoginFormPage";
import RegisterFormPage from "../pages/AuthPages/RegisterFormPage";
import ResendVerification from "../pages/ResendVerification/ResendVerification";
import VerifyEmail from "../pages/VerifyEmail/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

// Importa componentes de protección y layouts
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import UnauthorizedPage from "../pages/UnauthorizedPage/UnauthorizedPage";
import AppLayout from "../layouts/AppLayout/AppLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";

// Importa páginas de la aplicación
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import DashboardAttendancePage from "../pages/AdminDashboardPage/DashboardAttendancePage";
import NotificationsPage from "../pages/NotificationsPage/NotificationsPage";

// Importa páginas de usuarios
import UsersListPage from "../pages/UsersListPage/UsersListPage";
import UsersCreatePage from "../pages/UsersCreatePage/UsersCreatePage";
import UsersShowPage from "../pages/UsersShowPage/UsersShowPage";

// Importa páginas de aprendices
import ApprentincesListPage from "../pages/ApprenticesListPage/ApprenticesListPage";
import ApprenticesShowPage from "../pages/ApprenticesShowPage/ApprenticesShowPage";
import ApprenticesCreatePage from "../pages/ApprenticesCreatePage/ApprenticesCreatePage";

// Importa páginas de programas de formación
import ProgramsListPage from "../pages/ProgramsListPage/ProgramsListPage";
import ProgramsCreatePage from "../pages/ProgramsCreatePage/ProgramsCreatePage";
import ProgramShowPage from "../pages/ProgramsShowPage/ProgramsShowPage";

// Importa páginas de fichas y sus relaciones
import FichasListPage from "../pages/FichasListPage/FichasListPage";
import FichasCreatePage from "../pages/FichasCreatePage/FichasCreatePage";
import FichasShowPage from "../pages/FichasShowPage/FichasShowPage";
import AttendanceRegisterStaticPage from "../pages/AttendanceRegisterStaticPage/AttendanceRegisterStaticPage";
import FichaTermCreatePage from "../pages/FichaTermCreatePage/FichaTermCreatePage";
import FichaTermUpdatePage from "../pages/FichaTermUpdatePage/FichaTermUpdatePage";
import ScheduleFichaTermPage from "../pages/ScheduleFichaTermPage/ScheduleFichaTermPage";
import SessionScheduleCreatePage from "../pages/SessionScheduleCreatePage/SessionScheduleCreatePage";
import SessionScheduleUpdatePage from "../pages/SessionScheduleUpdatePage/SessionScheduleUpdatePage";

// Importa páginas de clases reales
import RealClassesListPage from "../pages/RealClassesListPage/RealClassesListPage";
import RealClassesCreatePage from "../pages/RealClassesCreatePage/RealClassesCreatePage";
import RealClassShowPage from "../pages/RealClassesShowPage/RealClassShowPage";
import RealClassAttendancesListPage from "../pages/RealClassAttendancesListPage/RealClassAttendancesListPage";

// Importa páginas de días sin clase
import NoClassDaysListPage from "../pages/NoClassDaysListPage/NoClassDaysListPage";
import NoClassDayShowPage from "../pages/NoClassDayShowPage/noClassDayShowPage";
import NoClassDayCreatePage from "../pages/NoClassDayCreatePage/NoClassDayCreatePage";

// Importa páginas de áreas y roles
import AreasListPage from "../pages/AreasListPage/AreasListPage";
import AreaShowPage from "../pages/AreasShowPage/AreasShowPage";
import AreasCreatePage from "../pages/AreasCreatePage/AreasCreatePage";
import RolesListPage from "../pages/RolesListPage/RolesListPage";
import RoleShowPage from "../pages/RolesShowPage/RolesShowPage";
import RolesCreatePage from "../pages/RolesCreatePage/RolesCreatePage";

/**
 * Configuración de rutas de la aplicación usando React Router v6.
 * 
 * Estructura de rutas en tres niveles:
 * 
 * 1. Rutas públicas (AuthLayout):
 *    - Login, Registro
 *    - Verificación de email
 *    - Recuperación de contraseña
 * 
 * 2. Rutas protegidas (ProtectedRoute + AppLayout):
 *    - Requieren autenticación
 *    - Tienen layout con sidebar y header
 *    - Todas las páginas de gestión (usuarios, fichas, etc.)
 * 
 * 3. Rutas especiales:
 *    - /unauthorized (sin layout)
 *    - Rutas de verificación de email
 * 
 * Patrones de rutas:
 * - Listas: /recursos (ej: /users, /fichas)
 * - Crear: /recursos/create
 * - Detalle: /recursos/:id
 * - Anidadas: /parent/:parentId/child/:childId
 * 
 * @constant
 * @type {Router}
 * 
 * @example
 * // Uso en main.jsx o App.jsx
 * import { RouterProvider } from "react-router-dom";
 * import { router } from "./router/router";
 * 
 * function App() {
 *   return <RouterProvider router={router} />;
 * }
 */
export const router = createBrowserRouter([
    /**
     * GRUPO 1: Rutas de autenticación (públicas).
     * 
     * Usan AuthLayout que proporciona:
     * - Card visual centrado
     * - Logo y branding
     * - Pestañas entre login/registro
     */
    {
        element: <AuthLayout />,
        children: [
            // Raíz redirige a login
            { path: "/", element: <Navigate to="/login" replace /> },
            
            // Página de login
            { path: "/login", element: <LoginFormPage /> },
            
            // Página de registro
            { path: "/register", element: <RegisterFormPage /> },
        ],
    },

    /**
     * GRUPO 2: Rutas protegidas de la aplicación.
     * 
     * Primer nivel: ProtectedRoute (verifica autenticación)
     * Segundo nivel: AppLayout (sidebar, header, contenido)
     * Tercer nivel: Páginas específicas
     * 
     * Todas estas rutas requieren:
     * - Usuario autenticado (token válido)
     * - Permisos adecuados (según la página)
     */
    {
        // ProtectedRoute verifica autenticación antes de renderizar
        element: <ProtectedRoute />,
        children: [
            {
                // AppLayout proporciona estructura con sidebar y header
                element: <AppLayout />,
                children: [
                    // Dashboard principal
                    { path: "/home", element: <DashboardAttendancePage /> },
                    
                    /**
                     * USUARIOS: CRUD completo
                     */
                    { path: "/users", element: <UsersListPage /> },
                    { path: "/users/create", element: <UsersCreatePage /> },
                    { path: "/users/:id", element: <UsersShowPage /> },
                    
                    /**
                     * APRENDICES: CRUD completo
                     */
                    { path: "/apprentices", element: <ApprentincesListPage /> },
                    { path: "/apprentices/create", element: <ApprenticesCreatePage /> },
                    { path: "/apprentices/:id", element: <ApprenticesShowPage /> },
                    
                    /**
                     * PROGRAMAS DE FORMACIÓN: CRUD completo
                     */
                    { path: "/training_programs", element: <ProgramsListPage /> },
                    { path: "/training_programs/create", element: <ProgramsCreatePage /> },
                    { path: "/training_programs/:id", element: <ProgramShowPage /> },
                    
                    /**
                     * FICHAS: CRUD + relaciones anidadas
                     * 
                     * Estructura anidada:
                     * - Ficha base: /fichas/:fichaId
                     * - Asistencias: /fichas/:fichaId/attendances
                     * - Trimestres: /fichas/:fichaId/ficha_terms/...
                     * - Horarios: /fichas/:fichaId/ficha_terms/:fichaTermId/schedule/...
                     * - Sesiones: .../schedule/:scheduleId/session/...
                     */
                    { path: "/fichas", element: <FichasListPage /> },
                    { path: "/fichas/create", element: <FichasCreatePage /> },
                    { path: "/fichas/:fichaId", element: <FichasShowPage /> },
                    { path: "/fichas/:fichaId/attendances", element: <AttendanceRegisterStaticPage /> },
                    
                    // Trimestres de fichas
                    { path: "/fichas/:fichaId/ficha_terms/create", element: <FichaTermCreatePage /> },
                    { path: "/fichas/:fichaId/ficha_terms/:fichaTermId/update", element: <FichaTermUpdatePage /> },
                    
                    // Horarios de trimestres
                    { path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule", element: <ScheduleFichaTermPage /> },
                    
                    // Sesiones de horarios
                    { path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule/:scheduleId/session/create", element: <SessionScheduleCreatePage /> },
                    { path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule/:scheduleId/session/:sessionId/update", element: <SessionScheduleUpdatePage /> },
                    
                    /**
                     * CLASES REALES: CRUD + asistencias
                     */
                    { path: "/real_classes", element: <RealClassesListPage /> },
                    { path: "/real_classes/create", element: <RealClassesCreatePage /> },
                    { path: "/real_classes/:realClassId", element: <RealClassShowPage /> },
                    { path: "/real_classes/:realClassId/attendances", element: <RealClassAttendancesListPage /> },
                    
                    /**
                     * DÍAS SIN CLASE: CRUD completo
                     */
                    { path: "/no_class_days", element: <NoClassDaysListPage /> },
                    { path: "/no_class_days/:noClassDayId", element: <NoClassDayShowPage /> },
                    { path: "/no_class_days/create", element: <NoClassDayCreatePage /> },
                    
                    /**
                     * NOTIFICACIONES: Vista de usuario
                     */
                    { path: "/notifications", element: <NotificationsPage /> },
                    
                    /**
                     * ÁREAS: CRUD completo
                     */
                    { path: "/areas", element: <AreasListPage /> },
                    { path: "/areas/:areaId", element: <AreaShowPage /> },
                    { path: "/areas/create", element: <AreasCreatePage /> },
                    
                    /**
                     * ROLES: CRUD completo
                     */
                    { path: "/roles", element: <RolesListPage /> },
                    { path: "/roles/:roleId", element: <RoleShowPage /> },
                    { path: "/roles/create", element: <RolesCreatePage /> },
                    
                    /**
                     * PERFIL: Página de usuario
                     */
                    { path: "/profile", element: <ProfilePage /> },
                ],
            },
        ],
    },

    /**
     * GRUPO 3: Rutas especiales (sin layout específico).
     * 
     * Estas rutas no usan AuthLayout ni AppLayout.
     */
    
    // Página de no autorizado (cuando falla validación de permisos)
    { path: "/unauthorized", element: <UnauthorizedPage /> },
    
    // Reenviar email de verificación
    { path: "/reenviar-verificacion", element: <ResendVerification /> },
    
    // Verificar email (con token en query string)
    { path: "/verificar-email", element: <VerifyEmail /> },
    
    // Solicitar recuperación de contraseña
    { path: "/forgot-password", element: <ForgotPassword /> },
    
    // Resetear contraseña (con token en query string)
    {path: "/reset-password", element: <ResetPassword />},
]);