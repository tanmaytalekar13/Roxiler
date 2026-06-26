import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Spinner from "../components/Spinner";

/**
 * ProtectedRoute
 * @prop {string[]} roles  - allowed roles; if empty, any authenticated user passes
 * @prop {string}   redirectTo - where to send unauthenticated users
 */
const ProtectedRoute = ({ roles = [], redirectTo = "/login" }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} replace />;

  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to their own dashboard rather than a generic 403
    const dashMap = { ADMIN: "/admin", USER: "/user", OWNER: "/owner" };
    return <Navigate to={dashMap[user.role] ?? "/"} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;