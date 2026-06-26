import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { adminGetStores } from "../../services/api";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import SortHeader from "../../components/SortHeader";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import Alert from "../../components/Alert";
import StarRating from "../../components/StarRating";

export default function AdminStores() {
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const limit = 10;

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await adminGetStores({ page, limit, search: search || undefined, sortBy, order });
      setStores(res.data.data.stores);
      setTotalPages(res.data.data.totalPages);
    } catch {
      setError("Failed to load stores.");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, order]);

  useEffect(() => { fetchStores(); }, [fetchStores]);
  useEffect(() => { setPage(1); }, [search, sortBy, order]);

  const handleSort = (col) => {
    if (sortBy === col) {
      setOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(col);
      setOrder("asc");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Stores</h1>
          <p className="text-sm text-slate-500 mt-1">All registered stores.</p>
        </div>
        <button
          onClick={() => navigate("/admin/stores/new")}
          className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Add store
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search by name, email, or address…" />

      {error && <Alert type="error" message={error} />}

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : stores.length === 0 ? (
        <EmptyState title="No stores found" description={search ? "Try a different search." : "Add the first store."} />
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                  <tr>
                    <SortHeader label="Name" col="name" sortBy={sortBy} order={order} onSort={handleSort} />
                    <SortHeader label="Email" col="email" sortBy={sortBy} order={order} onSort={handleSort} />
                    <SortHeader label="Address" col="address" sortBy={sortBy} order={order} onSort={handleSort} />
                    <SortHeader label="Rating" col="overallRating" sortBy={sortBy} order={order} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stores.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{s.name}</td>
                      <td className="px-6 py-4 text-slate-500">{s.email}</td>
                      <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{s.address}</td>
                      <td className="px-6 py-4">
                        {s.overallRating ? (
                          <div className="flex items-center gap-2">
                            <StarRating value={Math.round(s.overallRating)} readOnly size="sm" />
                            <span className="text-slate-700 font-medium">
                              {Number(s.overallRating).toFixed(1)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">No ratings</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}