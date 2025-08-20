// src/shared/components/NavBar.tsx
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../app/store";
import { logout } from "../../features/auth/model/auth.slice";
import { useCallback, useState } from "react";

export default function NavBar() {
  const nav = useNavigate();
  const dispatch = useDispatch();

  const { token, profile } = useSelector((s: RootState) => s.auth);
  const isAuthed = !!token;
  const role = profile?.role ?? null;

  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  const onLogout = useCallback(() => {
    dispatch(logout());
    nav("/login");
  }, [dispatch, nav]);

  const linkBase =
    "px-3 py-2 rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white";
  const active = "bg-gray-900";
  const inactive = "bg-transparent";

  return (
    <nav className="sticky top-0 z-40 bg-gray-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Left: brand + desktop links */}
          <div className="flex items-center gap-6">
            <Link to="/" className="text-lg font-semibold">
              LoanWise
            </Link>

            {/* Desktop links */}
            {isAuthed && (
              <div className="hidden md:flex items-center gap-1">
                {(role === "Lender" || role === "Admin") && (
                  <NavLink
                    to="/open-loans"
                    className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
                  >
                    Open Loans
                  </NavLink>
                )}
                <NavLink
                  to="/notifications"
                  className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
                >
                  Notifications
                </NavLink>
                <NavLink
                  to="/me"
                  className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
                >
                  Me
                </NavLink>

                {/* Admin menu */}
                {role === "Admin" && (
                  <>
                    <NavLink
                      to="/admin/users"
                      className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
                    >
                      Admin: Users
                    </NavLink>
                    <NavLink
                      to="/admin/maintenance"
                      className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
                    >
                      Admin: Maintenance
                    </NavLink>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right: greeting + actions (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthed && profile && (
              <span className="text-sm text-gray-200 truncate max-w-[260px]">
                Hi, {profile.fullName || profile.email} ({profile.role})
              </span>
            )}

            {isAuthed ? (
              <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">
                Logout
              </button>
            ) : (
              <Link to="/login" className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={toggle}
            className="md:hidden inline-flex items-center justify-center rounded p-2 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Toggle main menu"
            aria-expanded={open}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
              {open ? (
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isAuthed && open && (
        <div className="md:hidden border-t border-gray-700">
          <div className="space-y-1 px-4 py-3">
            {(role === "Lender" || role === "Admin") && (
              <NavLink
                to="/open-loans"
                onClick={() => setOpen(false)}
                className={({ isActive }) => `${linkBase} block ${isActive ? active : inactive}`}
              >
                Open Loans
              </NavLink>
            )}
            <NavLink
              to="/notifications"
              onClick={() => setOpen(false)}
              className={({ isActive }) => `${linkBase} block ${isActive ? active : inactive}`}
            >
              Notifications
            </NavLink>
            <NavLink
              to="/me"
              onClick={() => setOpen(false)}
              className={({ isActive }) => `${linkBase} block ${isActive ? active : inactive}`}
            >
              Me
            </NavLink>

            {role === "Admin" && (
              <>
                <NavLink
                  to="/admin/users"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `${linkBase} block ${isActive ? active : inactive}`}
                >
                  Admin: Users
                </NavLink>
                <NavLink
                  to="/admin/maintenance"
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => `${linkBase} block ${isActive ? active : inactive}`}
                >
                  Admin: Maintenance
                </NavLink>
              </>
            )}

            <div className="pt-2 flex items-center justify-between">
              {profile ? (
                <span className="text-sm text-gray-300">
                  {profile.fullName || profile.email} ({profile.role})
                </span>
              ) : (
                <span className="text-sm text-gray-300">Not signed in</span>
              )}

              {isAuthed ? (
                <button
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                  className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
