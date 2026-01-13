import { Link } from "react-router-dom";
import "./ForgotPasswordLink.css";

export default function ForgotPasswordLink({ to = "/forgot-password", children }) {
  return (
    <div className="forgot">
      <Link className="forgot__link" to={to}>
        {children ?? "¿Olvidaste tu contraseña?"}
      </Link>
    </div>
  );
}
