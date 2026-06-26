import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminGetUser } from "../../services/api";
import Spinner from "../../components/Spinner";
import Alert from "../../components/Alert";
import Badge from "../../components/Badge";
import StarRating from "../../components/StarRating";

const ROLE_VARIANT = { ADMIN: "danger", USER: "success", OWNER: "info" };

function Detail({ label, value }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm text-slate-800">{value || "—"}</p>
    </div>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await adminGetUser(id);
        setUser(res.data.data);
      } catch {
        setError("Failed to load user.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  if (error) return <Alert type="error" message={error} />;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/admin/users")}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
        >
          ← Back
        </button>
        <h1 className="text-2xl font-bold text-slate-800">User details</h1>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        {/* Role badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
              {user.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-slate-800">{user.name}</p>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>
          <Badge variant={ROLE_VARIANT[user.role] || "default"}>{user.role}</Badge>
        </div>

        <hr className="border-slate-100" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Detail label="Name" value={user.name} />
          <Detail label="Email" value={user.email} />
          <Detail label="Address" value={user.address} />
          <Detail label="Role" value={user.role} />
        </div>

        {/* Show store rating if Owner */}
        {user.role === "OWNER" && user.store && (
          <>
            <hr className="border-slate-100" />
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">Store</p>
              <p className="text-sm font-semibold text-slate-800">{user.store.name}</p>
              <div className="flex items-center gap-2">
                <StarRating
                  value={Math.round(user.store.averageRating || 0)}
                  readOnly
                  size="sm"
                />
                <span className="text-sm text-slate-600 font-medium">
                  {user.store.averageRating
                    ? Number(user.store.averageRating).toFixed(1)
                    : "No ratings yet"}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}