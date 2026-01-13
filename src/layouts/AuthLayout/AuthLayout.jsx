// src/pages/auth/AuthLayoutPage.jsx
import { Outlet, useLocation } from "react-router-dom";
import AuthCard from "../../components/AuthCard/AuthCard";
import AuthTabs from "../../components/AuthTabs/AuthTabs";
import "./AuthLayout.css";

export default function AuthLayout() {
  const { pathname } = useLocation();

  const isRegister = pathname.startsWith("/register");

  const wrapperClass = isRegister ? "register" : "login";
  const title = isRegister ? "Crea tu cuenta" : "Bienvenido de nuevo";
  const subtitle = isRegister
    ? "Completa los datos para registrarte"
    : "Ingresa tus credenciales para continuar";

  return (
    <div className="auth-layout">
      <AuthCard
        title={title}
        subtitle={subtitle}
        left={
          <div className={`${wrapperClass}__brand`}>
            <div className={`${wrapperClass}__logo`}>
              <img
                src="/logo_sena_white.png"
                alt="Logo SENA"
                className={`${wrapperClass}__logoImg`}
              />
            </div>
            <div className={`${wrapperClass}__brandText`}>Asistencia SENA</div>
          </div>
        }
      >
        <AuthTabs />
        <Outlet />
      </AuthCard>
    </div>
  );
}