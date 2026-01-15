import { matchPath, Outlet, useLocation } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import AppSidebar from "../../components/AppSidebar/AppSidebar";
import "./AppLayout.css";

const pageTitles = {
  "/home": "Dashboard",
  "/users": "Usuarios",
  "/users/create": "Crear Usuario",
  "/users/:id": "Detalle de Usuario",
  "/profile": "Perfil",
};

export default function AppLayout() {

  const location = useLocation();
  const title =
    Object.entries(pageTitles).find(([pattern]) =>
      matchPath({ path: pattern, end: true }, location.pathname)
    )?.[1] ?? "App";

  return (
    <div className="app-layout">
      <AppSidebar />
      <div className="app-layout__main">
        <AppHeader title={title} />
        <main className="app-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
