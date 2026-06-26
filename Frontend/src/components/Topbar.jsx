import { ROLE_LABELS } from "../constants/index";
import useAuth from "../hooks/useAuth";

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="flex-shrink-0 h-16 bg-white border-b border-slate-200 flex items-center px-4 sm:px-6 gap-4">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Role badge + name */}
      <div className="flex items-center gap-3">
        <span className="hidden sm:inline-block text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
          {ROLE_LABELS[user?.role]}
        </span>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name}</p>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
          <span className="text-indigo-600 text-sm font-bold uppercase">
            {user?.name?.[0] ?? "U"}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;