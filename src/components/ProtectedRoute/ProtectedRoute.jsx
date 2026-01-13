import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuth } from "../../utils/auth";

export default function ProtectedRoute({isAllowed = true, redirectTo = "/login"}) {
  const location = useLocation();

  if (!isAuth()) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (!isAllowed) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <Outlet />;
}