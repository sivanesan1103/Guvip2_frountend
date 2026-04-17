import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const homeByRole = (role) => (role === "ADMIN" ? "/admin/dashboard" : "/dashboard");

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  if (roles && !roles.includes(role)) {
    return <Navigate to={homeByRole(role)} replace />;
  }
  return children;
}
