import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

function ProtectedAuth() {
  const refresToken = Cookies.get("token");

  return refresToken ? <Navigate to="/dashboard" replace /> : <Outlet />;
}

export default ProtectedAuth;
