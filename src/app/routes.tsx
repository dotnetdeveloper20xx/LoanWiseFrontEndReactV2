import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import RootLayout from "../app/RootLayout";
import Landing from "./Landing";

// Pages
const Home = lazy(() => import("../features/loans/pages/OpenLoansPage"));
const Login = lazy(() => import("../features/auth/pages/LoginPage"));
const Register = lazy(() => import("../features/auth/pages/RegisterPage"));
const Me = lazy(() => import("../features/auth/pages/MePage"));
const Notifications = lazy(() => import("../features/notifications/pages/NotificationsPage"));
const OpenLoans = lazy(() => import("../features/loans/pages/OpenLoansPage"));

// Admin
const AdminUsersPage = lazy(() => import("../features/admin/pages/AdminUsersPage"));
const AdminMaintenancePage = lazy(() => import("../features/admin/pages/AdminMaintenancePage"));
const AdminAllLoansPage = lazy(() => import("../features/admin/pages/AdminAllLoansPage"));

// Borrower
const ApplyLoanPage = lazy(() => import("../features/loans/pages/ApplyLoanPage"));
const BorrowerDashboardPage = lazy(() => import("../features/loans/pages/BorrowerDashboardPage"));

// Lender
const LenderDashboardPage = lazy(() => import("../features/lenders/pages/LenderDashboardPage"));
const LenderPortfolioPage = lazy(() => import("../features/lenders/pages/LenderPortfolioPage"));
const LenderTransactionsPage = lazy(
  () => import("../features/lenders/pages/LenderTransactionsPage")
);

// Shared
const LoanRepaymentsPage = lazy(() => import("../features/loans/pages/LoanRepaymentsPage"));
const BorrowerRiskPage = lazy(() => import("../features/borrowers/pages/BorrowerRiskPage"));

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
      { index: true, element: <Landing /> },

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

      // Any authenticated user (common pages + repayments page)
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
          // ← Make repayments visible for Borrower/Lender/Admin. API enforces role-specific behavior.
          {
            path: "/loans/:loanId/repayments",
            element: (
              <S>
                <LoanRepaymentsPage />
              </S>
            ),
          },
        ],
      },

      // Borrower-only
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

      // Lender/Admin → Open Loans
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

      // Lender-only
      {
        element: <ProtectedRoute roles={["Lender"]} />,
        children: [
          {
            path: "/lender/dashboard",
            element: (
              <S>
                <LenderDashboardPage />
              </S>
            ),
          },
          {
            path: "/lender/portfolio",
            element: (
              <S>
                <LenderPortfolioPage />
              </S>
            ),
          },
          {
            path: "/lender/transactions",
            element: (
              <S>
                <LenderTransactionsPage />
              </S>
            ),
          },
        ],
      },

      // Admin-only
      {
        element: <ProtectedRoute roles={["Admin"]} />,
        children: [
          {
            path: "/admin/all-loans",
            element: (
              <S>
                <AdminAllLoansPage />
              </S>
            ),
          },
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

      // Risk (all roles)
      {
        element: <ProtectedRoute roles={["Admin", "Borrower", "Lender"]} />,
        children: [
          {
            path: "/borrowers/:borrowerId/risk",
            element: (
              <S>
                <BorrowerRiskPage />
              </S>
            ),
          },
        ],
      },
    ],
  },
]);

export default routers;
