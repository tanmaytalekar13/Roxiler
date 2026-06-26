import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Auth pages
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

// Admin pages
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserDetail from "../pages/admin/AdminUserDetail";
import AddUser from "../pages/admin/AddUser";
import AdminStores from "../pages/admin/AdminStores";
import AddStore from "../pages/admin/AddStore";

// User pages
import UserStores from "../pages/user/UserStores";
import UserChangePassword from "../pages/user/ChangePassword";

// Owner pages
import OwnerDashboard from "../pages/owner/OwnerDashboard";
import OwnerChangePassword from "../pages/owner/OwnerChangePassword";

// Misc
import NotFound from "../pages/NotFound";

// ─── Protected route wrapper ──────────────────────────────────────────────
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null; // AuthContext is rehydrating

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    // Send user to their own home if they hit a wrong-role route
    const home =
      user.role === "ADMIN"
        ? "/admin"
        : user.role === "OWNER"
        ? "/owner"
        : "/stores";
    return <Navigate to={home} replace />;
  }

  return children;
}

// ─── Root redirect by role ────────────────────────────────────────────────
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
  if (user.role === "OWNER") return <Navigate to="/owner" replace />;
  return <Navigate to="/stores" replace />;
}

// ─── Router ───────────────────────────────────────────────────────────────
export default function AppRouter() {
  return (
      <Routes>
        {/* Root */}
        <Route path="/" element={<RootRedirect />} />

        {/* Public auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/users/new" element={<AddUser />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />
          <Route path="/admin/stores" element={<AdminStores />} />
          <Route path="/admin/stores/new" element={<AddStore />} />
        </Route>

        {/* User (normal) routes */}
        <Route
          element={
            <ProtectedRoute roles={["USER"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/stores" element={<UserStores />} />
          <Route path="/change-password" element={<UserChangePassword />} />
        </Route>

        {/* Owner routes */}
        <Route
          element={
            <ProtectedRoute roles={["OWNER"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/owner" element={<OwnerDashboard />} />
          <Route path="/owner/change-password" element={<OwnerChangePassword />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
  );
}