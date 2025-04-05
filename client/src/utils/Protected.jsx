import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function Protected({ isAuth = false }) {
  const refresToken = Cookies.get("token");

  if (isAuth) {
    return refresToken ? <Outlet /> : <Navigate to="/login" replace />;
  } else {
    return refresToken ? <Navigate to="/dashboard" replace /> : <Outlet />;
  }
}

export default Protected;
