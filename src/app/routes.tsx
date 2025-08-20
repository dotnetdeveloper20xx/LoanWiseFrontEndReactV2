import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import RootLayout from "../app/RootLayout";

// Pages (lazy)
const Home = lazy(() => import("../features/loans/pages/OpenLoansPage")); // keep as your home
const Login = lazy(() => import("../features/auth/pages/LoginPage"));
const Register = lazy(() => import("../features/auth/pages/RegisterPage"));
const Me = lazy(() => import("../features/auth/pages/MePage"));
const Notifications = lazy(() => import("../features/notifications/pages/NotificationsPage"));
const OpenLoans = lazy(() => import("../features/loans/pages/OpenLoansPage"));

// Admin pages (new)
const AdminUsersPage = lazy(() => import("../features/admin/pages/AdminUsersPage"));
const AdminMaintenancePage = lazy(() => import("../features/admin/pages/AdminMaintenancePage"));

// Small Suspense helper so each route gets a fallback
const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-4">Loading…</div>}>{children}</Suspense>
);

function NotFound() {
  return <div className="p-6">Sorry, nothing at this address.</div>;
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />, // <Navbar/> is inside, has Router context
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: (
          <S>
            <Home />
          </S>
        ),
      },

      // Public
      {
        path: "/login",
        element: (
          <S>
            <Login />
          </S>
        ),
      },
      {
        path: "/register",
        element: (
          <S>
            <Register />
          </S>
        ),
      },

      // Any authenticated user
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/me",
            element: (
              <S>
                <Me />
              </S>
            ),
          },
          {
            path: "/notifications",
            element: (
              <S>
                <Notifications />
              </S>
            ),
          },
        ],
      },

      // Role-gated: Lender/Admin
      {
        element: <ProtectedRoute roles={["Lender", "Admin"]} />,
        children: [
          {
            path: "/open-loans",
            element: (
              <S>
                <OpenLoans />
              </S>
            ),
          },
        ],
      },

      // Role-gated: Admin only
      {
        element: <ProtectedRoute roles={["Admin"]} />,
        children: [
          {
            path: "/admin/users",
            element: (
              <S>
                <AdminUsersPage />
              </S>
            ),
          },
          {
            path: "/admin/maintenance",
            element: (
              <S>
                <AdminMaintenancePage />
              </S>
            ),
          },
        ],
      },
    ],
  },
]);

export default router;
