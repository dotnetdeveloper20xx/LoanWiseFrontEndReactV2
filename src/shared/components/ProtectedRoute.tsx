import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

export default function ProtectedRoute({
  roles,
}: {
  roles?: Array<"Borrower" | "Lender" | "Admin">;
}) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && role && !roles.includes(role)) return <Navigate to="/" replace />;
  return <Outlet />;
}
