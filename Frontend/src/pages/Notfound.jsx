import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const home = user
    ? user.role === "ADMIN"
      ? "/admin"
      : user.role === "OWNER"
      ? "/owner"
      : "/stores"
    : "/login";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center space-y-4 max-w-sm">
        <p className="text-7xl font-bold text-slate-200">404</p>
        <h1 className="text-xl font-semibold text-slate-800">Page not found</h1>
        <p className="text-sm text-slate-500">
          The page you're looking for doesn't exist or you don't have access to it.
        </p>
        <button
          onClick={() => navigate(home)}
          className="mt-4 inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Go home
        </button>
      </div>
    </div>
  );
}