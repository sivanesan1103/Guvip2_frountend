import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppLayout() {
  const { role, logout, email } = useAuth();
  const navigate = useNavigate();
  const isAdmin = role === "ADMIN";
  const homePath = isAdmin ? "/admin/dashboard" : "/dashboard";

  const onLogout = () => {
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to={homePath} className="text-lg font-bold text-slate-800">
            Assessment Platform
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <NavLink to={homePath} className="text-slate-600 hover:text-slate-900">
              Dashboard
            </NavLink>
            {isAdmin ? (
              <>
                <NavLink to="/admin/quizzes" className="text-slate-600 hover:text-slate-900">
                  Create/Edit Quiz
                </NavLink>
                <NavLink to="/admin/results" className="text-slate-600 hover:text-slate-900">
                  View Results
                </NavLink>
                <NavLink to="/admin/users" className="text-slate-600 hover:text-slate-900">
                  Manage Users
                </NavLink>
              </>
            ) : (
              <>
                <NavLink to="/quizzes" className="text-slate-600 hover:text-slate-900">
                  Quiz List
                </NavLink>
                <NavLink to="/my-results" className="text-slate-600 hover:text-slate-900">
                  My Results
                </NavLink>
              </>
            )}
            <span className="rounded bg-slate-100 px-2 py-1 text-xs">{email}</span>
            <button onClick={onLogout} className="rounded bg-slate-900 px-3 py-1.5 text-white">
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
