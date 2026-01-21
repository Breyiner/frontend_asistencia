import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginFormPage from "../pages/AuthPages/LoginFormPage";
import RegisterFormPage from "../pages/AuthPages/RegisterFormPage";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import UnauthorizedPage from "../pages/UnauthorizedPage/UnauthorizedPage";
import AppLayout from "../layouts/AppLayout/AppLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";
import ProfilePage from "../pages/ProfilePage/ProfilePage";
import UsersListPage from "../pages/UsersListPage/UsersListPage";
import UsersCreatePage from "../pages/UsersCreatePage/UsersCreatePage";
import UsersShowPage from "../pages/UsersShowPage/UsersShowPage";
import ApprentincesListPage from "../pages/ApprenticesListPage/ApprenticesListPage";
import ApprenticesShowPage from "../pages/ApprenticesShowPage/ApprenticesShowPage";
import ApprenticesCreatePage from "../pages/ApprenticesCreatePage/ApprenticesCreatePage";
import ProgramsListPage from "../pages/ProgramsListPage/ProgramsListPage";
import ProgramsCreatePage from "../pages/ProgramsCreatePage/ProgramsCreatePage";
import ProgramShowPage from "../pages/ProgramsShowPage/ProgramsShowPage";
import FichasListPage from "../pages/FichasListPage/FichasListPage";
import FichasCreatePage from "../pages/FichasCreatePage/FichasCreatePage";
import FichasShowPage from "../pages/FichasShowPage/FichasShowPage";
import FichaTermCreatePage from "../pages/FichaTermCreatePage/FichaTermCreatePage";
import FichaTermUpdatePage from "../pages/FichaTermUpdatePage/FichaTermUpdatePage";
import ScheduleFichaTermPage from "../pages/ScheduleFichaTermPage/ScheduleFichaTermPage";
import SessionScheduleCreatePage from "../pages/SessionScheduleCreatePage/SessionScheduleCreatePage";

function HomePage() {
    return (
        <div style={{ padding: "24px", textAlign: "center" }}>
            <h2>¡Layout funcionando!</h2>
            <p>Sidebar y Header se ven perfectos aquí.</p>
        </div>
    );
}

export const router = createBrowserRouter([
    // AUTH (público)
    {
        element: <AuthLayout />,
        children: [
            { path: "/", element: <Navigate to="/login" replace /> },
            { path: "/login", element: <LoginFormPage /> },
            { path: "/register", element: <RegisterFormPage /> },
        ],
    },

    // APP (protegido)
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    { path: "/home", element: <HomePage /> },
                    { path: "/users", element: <UsersListPage /> },
                    { path: "/users/create", element: <UsersCreatePage /> },
                    { path: "/users/:id", element: <UsersShowPage /> },
                    { path: "/apprentices", element: <ApprentincesListPage /> },
                    { path: "/apprentices/create", element: <ApprenticesCreatePage /> },
                    { path: "/apprentices/:id", element: <ApprenticesShowPage /> },
                    { path: "/training_programs", element: <ProgramsListPage /> },
                    { path: "/training_programs/create", element: <ProgramsCreatePage /> },
                    { path: "/training_programs/:id", element: <ProgramShowPage /> },
                    { path: "/fichas", element: <FichasListPage /> },
                    { path: "/fichas/create", element: <FichasCreatePage /> },
                    { path: "/fichas/:fichaId", element: <FichasShowPage /> },
                    { path: "/fichas/:fichaId/ficha_terms/create", element: <FichaTermCreatePage /> },
                    { path: "/fichas/:fichaId/ficha_terms/:fichaTermId/update", element: <FichaTermUpdatePage /> },
                    { path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule", element: <ScheduleFichaTermPage /> },
                    { path: "/fichas/:fichaId/ficha_terms/:fichaTermId/schedule/:scheduleId/session/create", element: <SessionScheduleCreatePage /> },
                    { path: "/profile", element: <ProfilePage /> },
                ],
            },
        ],
    },

    { path: "/unauthorized", element: <UnauthorizedPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
]);