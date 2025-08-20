import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import RootLayout from "../app/RootLayout";

// Pages (lazy)
const Home = lazy(() => import("../features/loans/pages/OpenLoansPage"));
const Login = lazy(() => import("../features/auth/pages/LoginPage"));
const Register = lazy(() => import("../features/auth/pages/RegisterPage"));
const Me = lazy(() => import("../features/auth/pages/MePage"));
const Notifications = lazy(() => import("../features/notifications/pages/NotificationsPage"));
const OpenLoans = lazy(() => import("../features/loans/pages/OpenLoansPage"));

// Admin pages
const AdminUsersPage = lazy(() => import("../features/admin/pages/AdminUsersPage"));
const AdminMaintenancePage = lazy(() => import("../features/admin/pages/AdminMaintenancePage"));

// Borrower pages (NEW)
const ApplyLoanPage = lazy(() => import("../features/loans/pages/ApplyLoanPage"));
const BorrowerDashboardPage = lazy(() => import("../features/loans/pages/BorrowerDashboardPage"));

const S = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="p-4">Loading…</div>}>{children}</Suspense>
);

function NotFound() {
  return <div className="p-6">Sorry, nothing at this address.</div>;
}

export const routers = createBrowserRouter([
  {
    element: <RootLayout />,
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

      // Borrower only
      {
        element: <ProtectedRoute roles={["Borrower"]} />,
        children: [
          {
            path: "/borrower/apply",
            element: (
              <S>
                <ApplyLoanPage />
              </S>
            ),
          },
          {
            path: "/dashboard",
            element: (
              <S>
                <BorrowerDashboardPage />
              </S>
            ),
          },
        ],
      },

      // Lender/Admin
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

      // Admin only
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

export default routers;
