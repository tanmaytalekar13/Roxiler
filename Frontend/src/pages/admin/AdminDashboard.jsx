import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminDashboard } from "../../services/api";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";
import Alert from "../../components/Alert";

// Inline SVG icons that match StatCard's expected icon format (React component)
const UserIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

const StoreIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z" />
  </svg>
);

const StarIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await getAdminDashboard();
        setStats(res.data.data);
      } catch {
        setError("Failed to load dashboard stats.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview.</p>
      </div>

      {error && <Alert type="error" message={error} />}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* FIX: "title" → "label", emoji → icon component, color names corrected */}
        <StatCard label="Total Users"   value={stats?.totalUsers   ?? 0} icon={UserIcon}  color="indigo" />
        <StatCard label="Total Stores"  value={stats?.totalStores  ?? 0} icon={StoreIcon} color="emerald" />
        <StatCard label="Total Ratings" value={stats?.totalRatings ?? 0} icon={StarIcon}  color="amber" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">Users</h2>
          <p className="text-sm text-slate-500">Manage all users on the platform.</p>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin/users")} className="text-sm text-indigo-600 font-medium hover:underline">
              View all →
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => navigate("/admin/users/new")} className="text-sm text-indigo-600 font-medium hover:underline">
              Add user →
            </button>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
          <h2 className="font-semibold text-slate-800">Stores</h2>
          <p className="text-sm text-slate-500">Manage all stores on the platform.</p>
          <div className="flex gap-2">
            <button onClick={() => navigate("/admin/stores")} className="text-sm text-indigo-600 font-medium hover:underline">
              View all →
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => navigate("/admin/stores/new")} className="text-sm text-indigo-600 font-medium hover:underline">
              Add store →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}