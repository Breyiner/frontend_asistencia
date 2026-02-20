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
import PermissionProtectedRoute from "../components/PermissionProtectedRoute/PermissionProtectedRoute";
import ClassroomsListPage from "../pages/ClassroomsListPage/ClassroomsListPage";
import ClassroomShowPage from "../pages/ClassroomShowPage/ClassroomShowPage";
import ClassroomCreatePage from "../pages/ClassroomCreatePage/ClassroomCreatePage";
import DocumentTypesListPage from "../pages/DocumentTypesListPage/DocumentTypesListPage";
import DocumentTypeShowPage from "../pages/DocumentTypeShowPage/DocumentTypeShowPage";
import DocumentTypeCreatePage from "../pages/DocumentTypeCreatePage/DocumentTypeCreatePage";


/**
 * Configuración de rutas de la aplicación usando React Router v6.
 */
export const router = createBrowserRouter([
    /**
     * GRUPO 1: Rutas de autenticación (públicas).
     */
    {
        element: <AuthLayout />,
        children: [
            { path: "/", element: <Navigate to="/login" replace /> },
            { path: "/login", element: <LoginFormPage /> },
            { path: "/register", element: <RegisterFormPage /> },
        ],
    },

    /**
     * GRUPO 2: Rutas protegidas con permisos específicos (.viewAny).
     */
    {
        element: <ProtectedRoute />, // ← Mantiene verificación básica de auth
        children: [
            {
                element: <AppLayout />,
                children: [
                    // Dashboard (permiso genérico o siempre accesible)
                    {
                        path: "/home",
                        element: <DashboardAttendancePage />,
                        // Dashboard accesible para todos los roles autenticados
                    },

                    /**
                     * USUARIOS: CRUD completo ← PROTEGIDO
                     */
                    {
                        path: "/users",
                        element: (
                            <PermissionProtectedRoute permission="users.viewAny">
                                <UsersListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/users/create",
                        element: (
                            <PermissionProtectedRoute permission="users.create">
                                <UsersCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/users/:id",
                        element: (
                            <PermissionProtectedRoute permission="users.view">
                                <UsersShowPage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * APRENDICES: CRUD completo ← PROTEGIDO
                     */
                    {
                        path: "/apprentices",
                        element: (
                            <PermissionProtectedRoute permission="apprentices.viewAny">
                                <ApprentincesListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/apprentices/create",
                        element: (
                            <PermissionProtectedRoute permission="apprentices.create">
                                <ApprenticesCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/apprentices/:id",
                        element: (
                            <PermissionProtectedRoute permission="apprentices.view">
                                <ApprenticesShowPage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * PROGRAMAS DE FORMACIÓN: CRUD completo ← PROTEGIDO
                     */
                    {
                        path: "/training_programs",
                        element: (
                            <PermissionProtectedRoute permission="training_programs.viewAny">
                                <ProgramsListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/training_programs/create",
                        element: (
                            <PermissionProtectedRoute permission="training_programs.create">
                                <ProgramsCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/training_programs/:id",
                        element: (
                            <PermissionProtectedRoute permission="training_programs.view">
                                <ProgramShowPage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * FICHAS: CRUD + relaciones ← PROTEGIDO
                     */
                    {
                        path: "/fichas",
                        element: (
                            <PermissionProtectedRoute permission="fichas.viewAny">
                                <FichasListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/fichas/create",
                        element: (
                            <PermissionProtectedRoute permission="fichas.create">
                                <FichasCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/fichas/:fichaId",
                        element: (
                            <PermissionProtectedRoute permission="fichas.view">
                                <FichasShowPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/fichas/:fichaId/attendances",
                        element: (
                            <PermissionProtectedRoute permission="fichas.view">
                                <AttendanceRegisterStaticPage />
                            </PermissionProtectedRoute>
                        )
                    },

                    // Trimestres de fichas ← PROTEGIDO
                    {
                        path: "/fichas/:fichaId/ficha_terms/create",
                        element: (
                            <PermissionProtectedRoute permission="ficha_terms.create">
                                <FichaTermCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/fichas/:fichaId/ficha_terms/:fichaTermId/update",
                        element: (
                            <PermissionProtectedRoute permission="ficha_terms.update">
                                <FichaTermUpdatePage />
                            </PermissionProtectedRoute>
                        )
                    },

                    // Horarios de trimestres ← PROTEGIDO
                    {
                        path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule",
                        element: (
                            <PermissionProtectedRoute permission="schedule_sessions.byFichaId">
                                <ScheduleFichaTermPage />
                            </PermissionProtectedRoute>
                        )
                    },

                    // Sesiones de horarios ← PROTEGIDO
                    {
                        path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule/:scheduleId/session/create",
                        element: (
                            <PermissionProtectedRoute permission="schedule_sessions.create">
                                <SessionScheduleCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule/:scheduleId/session/:sessionId/update",
                        element: (
                            <PermissionProtectedRoute permission="schedule_sessions.update">
                                <SessionScheduleUpdatePage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * CLASES REALES: CRUD + asistencias ← PROTEGIDO
                     */
                    {
                        path: "/real_classes",
                        element: (
                            <PermissionProtectedRoute permission={["real_classes.viewAny", 'real_classes.viewManaged', 'real_classes.viewOwn']}>
                                <RealClassesListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/real_classes/create",
                        element: (
                            <PermissionProtectedRoute permission="real_classes.create">
                                <RealClassesCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/real_classes/:realClassId",
                        element: (
                            <PermissionProtectedRoute permission="real_classes.view">
                                <RealClassShowPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/real_classes/:realClassId/attendances",
                        element: (
                            <PermissionProtectedRoute permission="attendances.byClassRealId">
                                <RealClassAttendancesListPage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * DÍAS SIN CLASE: CRUD ← PROTEGIDO
                     */
                    {
                        path: "/no_class_days",
                        element: (
                            <PermissionProtectedRoute permission="no_class_days.viewAny">
                                <NoClassDaysListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/no_class_days/:noClassDayId",
                        element: (
                            <PermissionProtectedRoute permission="no_class_days.view">
                                <NoClassDayShowPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/no_class_days/create",
                        element: (
                            <PermissionProtectedRoute permission="no_class_days.create">
                                <NoClassDayCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * NOTIFICACIONES: Vista de usuario ← PROTEGIDO
                     */
                    {
                        path: "/notifications",
                        element: (
                            <PermissionProtectedRoute permission="notifications.viewAny">
                                <NotificationsPage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * ÁREAS: CRUD ← PROTEGIDO
                     */
                    {
                        path: "/areas",
                        element: (
                            <PermissionProtectedRoute permission="areas.viewAny">
                                <AreasListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/areas/:areaId",
                        element: (
                            <PermissionProtectedRoute permission="areas.view">
                                <AreaShowPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/areas/create",
                        element: (
                            <PermissionProtectedRoute permission="areas.create">
                                <AreasCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * ROLES: CRUD ← PROTEGIDO
                     */
                    {
                        path: "/roles",
                        element: (
                            <PermissionProtectedRoute permission="roles.viewAny">
                                <RolesListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/roles/:roleId",
                        element: (
                            <PermissionProtectedRoute permission="roles.view">
                                <RoleShowPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/roles/create",
                        element: (
                            <PermissionProtectedRoute permission="roles.create">
                                <RolesCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     *  AMBIENTES 
                     */
                    {
                        path: "/classrooms",
                        element: (
                            <PermissionProtectedRoute permission="classrooms.viewAny">
                                <ClassroomsListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/classrooms/:classroomId",
                        element: (
                            <PermissionProtectedRoute permission="classrooms.view">
                                <ClassroomShowPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/classrooms/create",
                        element: (
                            <PermissionProtectedRoute permission="classrooms.create">
                                <ClassroomCreatePage  />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     *  TIPOS DE DOCUMENTO 
                     */
                    {
                        path: "/document_types",
                        element: (
                            <PermissionProtectedRoute permission="document_types.viewAny">
                                <DocumentTypesListPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/document_types/:documentTypeId",
                        element: (
                            <PermissionProtectedRoute permission="document_types.view">
                                <DocumentTypeShowPage />
                            </PermissionProtectedRoute>
                        )
                    },
                    {
                        path: "/document_types/create",
                        element: (
                            <PermissionProtectedRoute permission="document_types.create">
                                <DocumentTypeCreatePage />
                            </PermissionProtectedRoute>
                        )
                    },

                    /**
                     * PERFIL: Siempre accesible para usuario autenticado
                     */
                    { path: "/profile", element: <ProfilePage /> },
                ],
            },
        ],
    },

    /**
     * GRUPO 3: Rutas especiales (sin layout específico).
     */
    { path: "/unauthorized", element: <UnauthorizedPage /> },
    { path: "/reenviar-verificacion", element: <ResendVerification /> },
    { path: "/verificar-email", element: <VerifyEmail /> },
    { path: "/forgot-password", element: <ForgotPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
]);
