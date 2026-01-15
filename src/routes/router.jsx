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
                    { path: "/profile", element: <ProfilePage /> },
                ],
            },
        ],
    },

    { path: "/unauthorized", element: <UnauthorizedPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
]);