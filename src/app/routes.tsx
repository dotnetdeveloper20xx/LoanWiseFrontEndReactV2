import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import RootLayout from "../app/RootLayout";

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
const AdminAllLoansPage = lazy(() => import("../features/admin/pages/AdminAllLoansPage")); // NEW

// Borrower
const ApplyLoanPage = lazy(() => import("../features/loans/pages/ApplyLoanPage"));
const BorrowerDashboardPage = lazy(() => import("../features/loans/pages/BorrowerDashboardPage"));

// Lender
const LenderDashboardPage = lazy(() => import("../features/lenders/pages/LenderDashboardPage"));
const LenderPortfolioPage = lazy(() => import("../features/lenders/pages/LenderPortfolioPage")); // NEW
const LenderTransactionsPage = lazy(
  () => import("../features/lenders/pages/LenderTransactionsPage")
); // NEW

// Repayments & Borrower risk (shared pages)
const LoanRepaymentsPage = lazy(() => import("../features/loans/pages/LoanRepaymentsPage")); // NEW
const BorrowerRiskPage = lazy(() => import("../features/borrowers/pages/BorrowerRiskPage")); // NEW (optional)

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

      // Borrower
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
          // Shared repayments page for borrower (also exposed below for Admin)
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

      // Lender/Admin -> Open Loans
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

      // Lender-only routes
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

      // Admin-only routes
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
          // Shared repayments page for admin (mirrors borrower route)
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

      // Optional: Borrower risk view for all three roles
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
