import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedCustomerRoute() {
  const access = localStorage.getItem("access");
  if (!access) return <Navigate to="/" replace />;
  return <Outlet />;
}
