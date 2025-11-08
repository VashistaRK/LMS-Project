import { Navigate, Outlet } from "react-router-dom";
import { useAuthContext } from "./context/AuthProvider";

export function RequireAdmin() {
  const { user, loading } = useAuthContext();

  if (loading) return <p>Loading…</p>;

  // Check if current user is in the allowed list
  return user && (user.role == "admin" || user.role == "Master_ADMIN") ? (
    <Outlet />
  ) : (
    <Navigate to="/" replace />
  );
}
