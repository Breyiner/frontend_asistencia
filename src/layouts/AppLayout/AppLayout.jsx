import { matchPath, Outlet, useLocation } from "react-router-dom";
import AppHeader from "../../components/AppHeader/AppHeader";
import AppSidebar from "../../components/AppSidebar/AppSidebar";
import "./AppLayout.css";

const pageTitles = {
  "/home": "Dashboard",
  "/users": "Usuarios",
  "/users/create": "Crear Usuario",
  "/users/:id": "Detalle de Usuario",
  "/apprentices": "Aprendices",
  "/apprentices/create": "Crear Aprendiz",
  "/apprentices/:id": "Detalle de Aprendiz",
  "/training_programs": "Programas de Formación",
  "/training_programs/create": "Crear Programa de Formación",
  "/training_programs/:id": "Detalle de Programa de Formación",
  "/fichas": "Fichas",
  "/fichas/create": "Crear Ficha",
  "/fichas/:id": "Detalle de Ficha",
  "/fichas/:id/ficha_terms/create": "Asociar Trimestre a Ficha",
  "/fichas/:id/ficha_terms/:id/update": "Editar Trimestre de Ficha",
  "/fichas/:id/ficha_terms/:id/schedule": "Horario de Trimestre de Ficha",
  "/fichas/:id/ficha_terms/:id/schedule/:id/session/create": "Crear Sesión Para Horario",
  "/fichas/:id/ficha_terms/:id/schedule/:id/session/:id/update": "Editar Sesión de Horario",
  "/real_classes": "Clases Reales",
  "/real_classes/create": "Crear Clase Real",
  "/real_classes/:id": "Detalle de Clase Real",
  "/real_classes/:id/attendances": "Asistencias de la Clase",
  "/no_class_days": "Días sin Clase",
  "/no_class_days/create": "Crear Día sin Clase",
  "/no_class_days/:id": "Detalle Día sin Clase",
  "/notifications": "Mis notificaciones",
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
