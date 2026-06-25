import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const ProtectedRoute = ({ allowedRoles }) => {
  const { loading, isAuthenticated, user } = useAuth();

  // Wait until session is restored
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <h1 className="text-xl font-semibold">Loading...</h1>
      </div>
    );
  }

  // User not logged in
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not allowed
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;