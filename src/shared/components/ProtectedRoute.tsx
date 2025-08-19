import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";

/**
 * Wraps protected routes. Usage in routes.tsx:
 *
 * {
 *   element: <ProtectedRoute roles={["Lender", "Admin"]} />,
 *   children: [{ path: "/loans/open", element: <OpenLoansPage /> }]
 * }
 */
export default function ProtectedRoute({
  roles,
}: {
  roles?: Array<"Borrower" | "Lender" | "Admin">;
}) {
  const { isAuthenticated, role } = useAuth();

  // If not logged in, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified and user role not in list, redirect home
  if (roles && role && !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  // Otherwise render child route
  return <Outlet />;
}
