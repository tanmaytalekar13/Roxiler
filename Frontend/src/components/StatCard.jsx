import Spinner from "./Spinner";

const StatCard = ({ label, value, icon: Icon, color = "indigo", loading }) => {
  const colors = {
    indigo: "bg-indigo-50 text-indigo-600",
    violet: "bg-violet-50 text-violet-600",
    emerald:"bg-emerald-50 text-emerald-600",
    amber:  "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        {loading ? (
          <Spinner size="sm" className="mt-1" />
        ) : (
          <p className="text-3xl font-bold text-slate-900 mt-0.5 tabular-nums">{value ?? "—"}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;