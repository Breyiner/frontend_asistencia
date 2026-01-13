import { createBrowserRouter, Navigate } from "react-router-dom";

import LoginFormPage from "../pages/AuthPages/LoginFormPage";
import RegisterFormPage from "../pages/AuthPages/RegisterFormPage";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import UnauthorizedPage from "../pages/UnauthorizedPage/UnauthorizedPage";
import AppLayout from "../layouts/AppLayout/AppLayout";
import AuthLayout from "../layouts/AuthLayout/AuthLayout";

function HomePage() {
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <h2>¡Layout funcionando!</h2>
      <p>Sidebar y Header se ven perfectos aquí.</p>
    </div>
  );
}

function ProfilePage() {
  return (
    <div style={{ padding: "24px", textAlign: "center" }}>
      <h2>Bienvenido al tu Perfil</h2>
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
                    { path: "/users", element: <HomePage /> },
                    { path: "/profile", element: <ProfilePage /> },
                ],
            },
        ],
    },

    { path: "/unauthorized", element: <UnauthorizedPage /> },
    { path: "*", element: <Navigate to="/" replace /> },
]);