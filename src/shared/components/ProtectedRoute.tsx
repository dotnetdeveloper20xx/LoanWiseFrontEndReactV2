import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../app/store";

/**
 * Protects nested routes by requiring a token and (optionally) one of the roles.
 * Fix: when token exists but profile isn't hydrated yet, show a light "checking"
 * gate instead of returning a 403 immediately. This prevents false negatives.
 */
export default function ProtectedRoute({
  roles,
}: {
  roles?: Array<"Borrower" | "Lender" | "Admin">;
}) {
  const { token, profile } = useSelector((s: RootState) => s.auth);
  const location = useLocation();

  // 1) No token → go to login
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2) Token present but role not available yet → wait (avoid false 403)
  //    This situation occurs right after login/refresh before /users/me hydrates.
  const role = profile?.role ?? null;
  if (roles && !role) {
    return (
      <div className="p-6">
        <h1 className="text-base font-semibold mb-1">Checking access…</h1>
        <p className="text-sm text-gray-600">Please wait while we verify your permissions.</p>
      </div>
    );
  }

  // 3) Role known but doesn't match → show inline 403 (don't redirect elsewhere)
  if (roles && role && !roles.includes(role as any)) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">403 — Not Authorized</h1>
        <p className="text-sm text-gray-600">You don't have access to this page.</p>
      </div>
    );
  }

  // 4) Authorized → render nested route
  return <Outlet />;
}
