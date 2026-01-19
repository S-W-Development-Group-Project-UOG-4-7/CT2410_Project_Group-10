import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedAdminRoute() {
  const access = localStorage.getItem("access");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user?.role || localStorage.getItem("role") || "").toLowerCase();

  if (!access) return <Navigate to="/" replace />;
  if (role !== "admin") return <Navigate to="/" replace />;

  return <Outlet />;
}
