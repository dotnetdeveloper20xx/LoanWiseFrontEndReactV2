import { Link } from "react-router-dom";
import { useAuth } from "../../features/auth/hooks/useAuth";


export default function Navbar() {
  const { isAuthenticated, profile } = useAuth();

  return (
    <header className="border-b border-black/10">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-semibold">
          LoanWise
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/loans/open" className="text-sm">
            Open Loans
          </Link>
          <Link to="/notifications" className="text-sm">
            Notifications
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/me" className="text-sm">
                Me
              </Link>
              <span className="text-sm">Hi, {profile?.fullName}</span>
            </>
          ) : (
            <>
              <Link to="/register" className="text-sm">
                Register
              </Link>
              <Link to="/login" className="btn">
                Login
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
