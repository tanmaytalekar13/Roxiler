import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function AuthLayout() {
  const { user, loading } = useAuth();

  // Still rehydrating — don't flash login page if user is actually logged in
  if (loading) return null;

  // Already logged in — send to correct dashboard
  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user.role === "OWNER") return <Navigate to="/owner" replace />;
    return <Navigate to="/stores" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">
        {/* Brand */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-indigo-600 tracking-tight">RateStore</h1>
          <p className="text-sm text-slate-500 mt-1">Rate the stores you love.</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <Outlet />
        </div>
      </div>
    </div>
  );
}