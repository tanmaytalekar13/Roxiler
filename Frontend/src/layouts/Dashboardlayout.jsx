import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { logout } from "../services/api";
import { setAccessToken } from "../services/api";

// ─── Nav config per role ────────────────────────────────────────────────────
const NAV = {
  ADMIN: [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/users", label: "Users" },
    { to: "/admin/stores", label: "Stores" },
  ],
  USER: [
    { to: "/stores", label: "Stores", exact: true },
    { to: "/change-password", label: "Change password" },
  ],
  OWNER: [
    { to: "/owner", label: "Dashboard", exact: true },
    { to: "/owner/change-password", label: "Change password" },
  ],
};

function NavItem({ to, label, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        [
          "block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-indigo-50 text-indigo-700"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

function Sidebar({ user, onLogout, onNavClick }) {
  const links = NAV[user?.role] || [];

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-slate-100">
        <span className="text-lg font-bold text-indigo-600 tracking-tight">RateStore</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {links.map((l) => (
          <NavItem key={l.to} {...l} onClick={onNavClick} />
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-2">
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-slate-800 truncate">{user?.name}</p>
          <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          <span className="inline-block mt-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {user?.role}
          </span>
        </div>
        <button
          onClick={onLogout}
          className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Log out
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (_) {
      // ignore
    } finally {
      setAccessToken(null);
      setUser(null);
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* ── Sidebar (desktop) ─────────────────────── */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-white border-r border-slate-200">
        <Sidebar user={user} onLogout={handleLogout} onNavClick={() => {}} />
      </aside>

      {/* ── Mobile drawer backdrop ─────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer ─────────────────────────── */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 md:hidden",
          drawerOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span className="text-lg font-bold text-indigo-600">RateStore</span>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <Sidebar
            user={user}
            onLogout={handleLogout}
            onNavClick={() => setDrawerOpen(false)}
          />
        </div>
      </aside>

      {/* ── Main content ──────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar (mobile only) */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setDrawerOpen(true)}
            className="text-slate-500 hover:text-slate-700 text-2xl leading-none"
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="text-base font-semibold text-indigo-600">RateStore</span>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}