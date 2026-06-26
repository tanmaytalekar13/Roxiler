import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="flex h-screen">

      <Sidebar />

      <div className="flex flex-1 flex-col">

        <Navbar />

        <main className="flex-1 overflow-y-auto bg-slate-100 p-8">
          <Outlet />
        </main>

      </div>

    </div>
  );
}