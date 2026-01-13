import { Outlet, useLocation } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import AppSidebar from "../../components/AppSidebar/AppSidebar";
import "./AppLayout.css";

const pageTitles = {
  "/home": "Dashboard",
  "/users": "Usuarios",
  "/profile": "Perfil",
};

export default function AppLayout() {

  const location = useLocation();
  const title = pageTitles[location.pathname];

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
