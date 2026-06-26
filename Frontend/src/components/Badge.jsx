const variants = {
  default: "bg-slate-100 text-slate-700",
  blue:    "bg-blue-100 text-blue-700",
  green:   "bg-green-100 text-green-700",
  red:     "bg-red-100 text-red-700",
  amber:   "bg-amber-100 text-amber-700",
  indigo:  "bg-indigo-100 text-indigo-700",
  violet:  "bg-violet-100 text-violet-700",
};

const roleBadge = { ADMIN: "red", OWNER: "violet", USER: "blue" };

const Badge = ({ children, variant = "default", role, className = "" }) => {
  const v = role ? (roleBadge[role] ?? "default") : variant;
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[v]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;