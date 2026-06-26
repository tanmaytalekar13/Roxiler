import { useState, useEffect } from "react";
import { getOwnerDashboard } from "../../services/api";
import Spinner from "../../components/Spinner";
import Alert from "../../components/Alert";
import StatCard from "../../components/StatCard";
import StarRating from "../../components/StarRating";
import SortHeader from "../../components/SortHeader";

const StarIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

const ChartIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
  </svg>
);

const UsersIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
);

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");

  useEffect(() => {
    (async () => {
      try {
        const res = await getOwnerDashboard();
        setData(res.data.data);
      } catch (e) {
        setError("Failed to load dashboard.");
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

  if (error) return <Alert type="error" message={error} />;

  const { store, users } = data;

  const sorted = [...(users || [])].sort((a, b) => {
    let aVal, bVal;
    if (sortBy === "name") {
      aVal = a.name.toLowerCase();
      bVal = b.name.toLowerCase();
    } else if (sortBy === "email") {
      aVal = a.email.toLowerCase();
      bVal = b.email.toLowerCase();
    } else if (sortBy === "rating") {
      aVal = a.rating;
      bVal = b.rating;
    } else if (sortBy === "submittedAt") {
      aVal = new Date(a.submittedAt);
      bVal = new Date(b.submittedAt);
    }
    if (aVal < bVal) return order === "asc" ? -1 : 1;
    if (aVal > bVal) return order === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (col) => {
    if (sortBy === col) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Store Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">{store.name}</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">{store.name}</h2>
            <p className="text-sm text-slate-500">{store.address}</p>
            <p className="text-sm text-slate-400 mt-0.5">{store.email}</p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <StarRating value={Math.round(store.averageRating || 0)} readOnly size="lg" />
            <span className="text-2xl font-bold text-slate-800">
              {store.averageRating ? Number(store.averageRating).toFixed(1) : "—"}
              <span className="text-sm font-normal text-slate-400"> / 5</span>
            </span>
          </div>
        </div>
      </div>

      {/* Stats row — FIX: label instead of title, icon component instead of emoji, valid color names */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Average Rating"
          value={store.averageRating ? Number(store.averageRating).toFixed(2) : "—"}
          icon={StarIcon}
          color="amber"
        />
        <StatCard
          label="Total Ratings"
          value={store.totalRatings ?? 0}
          icon={ChartIcon}
          color="indigo"
        />
        <StatCard
          label="Rated by Users"
          value={users?.length ?? 0}
          icon={UsersIcon}
          color="emerald"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-800">Customer Ratings</h2>
          <p className="text-sm text-slate-400 mt-0.5">Users who have rated your store.</p>
        </div>

        {sorted.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">
            No ratings submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <SortHeader label="Name"      col="name"        sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortHeader label="Email"     col="email"       sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortHeader label="Rating"    col="rating"      sortBy={sortBy} order={order} onSort={handleSort} />
                  <SortHeader label="Submitted" col="submittedAt" sortBy={sortBy} order={order} onSort={handleSort} />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sorted.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                    <td className="px-6 py-4 text-slate-500">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StarRating value={user.rating} readOnly size="sm" />
                        <span className="text-slate-700 font-medium">{user.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{formatDate(user.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}