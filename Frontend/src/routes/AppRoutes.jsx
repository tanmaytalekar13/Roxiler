import { Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import ProtectedRoute from "../components/common/ProtectedRoute";

import Unauthorized from "../pages/Unauthorized";

// Admin
import AdminDashboard from "../pages/admin/Dashboard";

// User
import StoreList from "../pages/user/StoreList";

// Owner
import OwnerDashboard from "../pages/owner/Dashboard";

export default function AppRoutes() {
  return (
    <Routes>

      <Route path="/" element={<Navigate to="/login" />} />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/unauthorized"
        element={<Unauthorized />}
      />

      {/* Admin Routes */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["ADMIN"]}
          />
        }
      >
        <Route
          path="/admin/dashboard"
          element={<AdminDashboard />}
        />
      </Route>

      {/* User Routes */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["USER"]}
          />
        }
      >
        <Route
          path="/stores"
          element={<StoreList />}
        />
      </Route>

      {/* Owner Routes */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["OWNER"]}
          />
        }
      >
        <Route
          path="/owner/dashboard"
          element={<OwnerDashboard />}
        />
      </Route>

    </Routes>
  );
}