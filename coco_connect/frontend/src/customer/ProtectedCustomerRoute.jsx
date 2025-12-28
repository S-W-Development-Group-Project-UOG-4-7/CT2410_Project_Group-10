import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedCustomerRoute() {
  const token = localStorage.getItem("access"); // or whatever you store
  const role = localStorage.getItem("role");    // we’ll set this on login

  if (!token) return <Navigate to="/" replace />;

  // adjust to your role values: "buyer" / "customer"
  if (role !== "buyer") return <Navigate to="/" replace />;

  return <Outlet />;
}
