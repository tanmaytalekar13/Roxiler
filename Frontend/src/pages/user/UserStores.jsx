import { useState, useEffect, useCallback } from "react";
import { getStores, submitRating, updateRating } from "../../services/api";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import Spinner from "../../components/Spinner";
import EmptyState from "../../components/EmptyState";
import Alert from "../../components/Alert";
import StarRating from "../../components/StarRating";
import Badge from "../../components/Badge";

const SORT_OPTIONS = [
  { value: "name", label: "Name" },
  { value: "address", label: "Address" },
  { value: "overallRating", label: "Rating" },
];

function StoreCard({ store, onRated }) {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [pendingRating, setPendingRating] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // userRating can be null, a plain number, or an object { _id, rating }
  // Normalise into two separate values so the rest of the component is clean.
  const existingRatingId =
    store.userRating && typeof store.userRating === "object"
      ? store.userRating.id
      : null;

  const existingRatingValue =
    store.userRating == null
      ? 0
      : typeof store.userRating === "object"
      ? store.userRating.rating ?? 0
      : Number(store.userRating);

  const hasRated = existingRatingValue > 0;

  // What the stars should show right now:
  //   hovered > pending (chosen but not yet saved) > existing > 0
  const displayRating = hoveredStar || pendingRating || existingRatingValue;

  const handleStarClick = (val) => {
    setPendingRating(val);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!pendingRating) return;

    setSubmitting(true);
    setError("");

    try {
      if (hasRated) {
        // --- UPDATE path ---
        if (!existingRatingId) {
          // Backend sent a numeric userRating without an _id.
          // We need the rating record id to call PUT /ratings/:id.
          // If your API returns the id as store.userRatingId, adjust here.
          throw new Error(
            "Rating ID missing from backend response. " +
              "Make sure your GET /stores response includes userRating.id."
          );
        }

        await updateRating(existingRatingId, { rating: pendingRating });
        setSuccess("Rating updated!");
      } else {
        // --- CREATE path ---
        // Support both _id (Mongo) and id (Prisma / SQL)
        const storeId = store._id ?? store.id;

        if (!storeId) {
          throw new Error("Store ID missing from backend response.");
        }

        await submitRating({ storeId, rating: pendingRating });
        setSuccess("Rating submitted!");
      }

      setPendingRating(null);
      onRated();
    } catch (e) {
      setError(e.response?.data?.message || e.message || "Failed to submit rating.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setPendingRating(null);
    setError("");
    setSuccess("");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-800 text-base truncate">{store.name}</h3>
          <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{store.address}</p>
        </div>
        {store.overallRating ? (
          <Badge variant="info" className="shrink-0 text-sm font-semibold px-2.5 py-1">
            ★ {Number(store.overallRating).toFixed(1)}
          </Badge>
        ) : (
          <Badge variant="default" className="shrink-0 text-xs px-2.5 py-1">
            No ratings yet
          </Badge>
        )}
      </div>

      {/* Overall rating display */}
      <div className="flex items-center gap-2">
        <StarRating value={Math.round(store.overallRating || 0)} readOnly size="sm" />
        <span className="text-xs text-slate-400">
          {store.overallRating
            ? `${Number(store.overallRating).toFixed(1)} overall`
            : "Be the first to rate"}
        </span>
      </div>

      <hr className="border-slate-100" />

      {/* User rating section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-600">Your rating</span>
          {hasRated && !pendingRating && (
            <span className="text-xs text-emerald-600 font-medium">✓ Rated</span>
          )}
        </div>

        <StarRating
          value={displayRating}
          onChange={handleStarClick}
          onHover={setHoveredStar}
          size="lg"
        />

        {success && !pendingRating && (
          <p className="text-xs text-emerald-600 font-medium">{success}</p>
        )}
        {error && <p className="text-xs text-red-500">{error}</p>}

        {pendingRating && (
          <div className="flex gap-2 pt-1">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {submitting ? "Saving…" : hasRated ? "Update rating" : "Submit rating"}
            </button>
            <button
              onClick={handleCancel}
              disabled={submitting}
              className="px-3 py-2 text-sm text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [refreshKey, setRefreshKey] = useState(0);
  const limit = 9;

  const fetchStores = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getStores({ page, limit, search, sortBy, order });
      setStores(res.data.data.stores);
      setTotalPages(res.data.data.totalPages);
    } catch (e) {
      setError("Failed to load stores.");
    } finally {
      setLoading(false);
    }
  }, [page, search, sortBy, order, refreshKey]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  // Reset to page 1 on search/sort change
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, order]);

  const handleRated = () => setRefreshKey((k) => k + 1);
  const toggleOrder = () => setOrder((o) => (o === "asc" ? "desc" : "asc"));

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Stores</h1>
        <p className="text-sm text-slate-500 mt-1">Browse and rate registered stores.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by name or address…"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleOrder}
            className="px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 bg-white hover:bg-slate-50 transition-colors"
            title={order === "asc" ? "Ascending" : "Descending"}
          >
            {order === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && <Alert type="error" message={error} />}

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Spinner size="lg" />
        </div>
      ) : stores.length === 0 ? (
        <EmptyState
          title={search ? "No stores match your search" : "No stores yet"}
          description={search ? "Try a different name or address." : "Check back later."}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stores.map((store) => (
              // Use _id ?? id to handle both Mongo and Prisma/SQL backends
              <StoreCard key={store._id ?? store.id} store={store} onRated={handleRated} />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}