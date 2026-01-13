import { useLocation, useNavigate, Link } from "react-router-dom";
import { isAuth } from "../../utils/auth";
import "./UnauthorizedPage.css";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const handleBack = () => {
    if (from) return navigate(from, { replace: true });
    navigate(-1);
  };

  return (
    <section className="unauthorized">
      <div className="unauthorized__card">
        <div className="unauthorized__logoWrap">
          <img
            src="/logo_sena_white.png"
            alt="Logo SENA"
            className="unauthorized__logo"
          />
        </div>

        <header className="unauthorized__header">
          <h1 className="unauthorized__title">403 Acceso denegado</h1>
          <p className="unauthorized__text">
            No tienes permisos para acceder a esta sección. Si crees que es un error,
            contacta al administrador.
          </p>
        </header>

        <div className="unauthorized__actions">
          {isAuth() ? (
            <button className="unauthorized__btn" type="button" onClick={handleBack}>
              Volver
            </button>
          ) : (
            <Link className="unauthorized__btn" to="/login" replace>
              Iniciar sesión
            </Link>
          )}

          <Link className="unauthorized__link" to="/" replace>
            Ir al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
