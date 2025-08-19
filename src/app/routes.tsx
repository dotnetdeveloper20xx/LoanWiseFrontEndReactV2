import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import RootLayout from "../app/RootLayout";

const Home = lazy(() => import("../features/loans/pages/OpenLoansPage"));
const Login = lazy(() => import("../features/auth/pages/LoginPage"));
const Register = lazy(() => import("../features/auth/pages/RegisterPage"));
const Me = lazy(() => import("../features/auth/pages/MePage"));
const Notifications = lazy(() => import("../features/notifications/pages/NotificationsPage"));
const OpenLoans = lazy(() => import("../features/loans/pages/OpenLoansPage"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />, // <Navbar/> is now INSIDE router context
    children: [
      { index: true, element: <Home /> },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },

      {
        element: <ProtectedRoute />, // any authenticated user
        children: [
          { path: "/me", element: <Me /> },
          { path: "/notifications", element: <Notifications /> },
        ],
      },
      {
        element: <ProtectedRoute roles={["Lender", "Admin"]} />,
        children: [{ path: "/loans/open", element: <OpenLoans /> }],
      },
    ],
  },
]);
