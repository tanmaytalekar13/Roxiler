import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "../constants";

/**
 * useTableData — manages page, search, sort state and fetches data
 * whenever any of those change.
 *
 * @param {Function} apiFn  (params) => Promise<AxiosResponse>
 * @param {Object}   extra  extra fixed params to merge (e.g. { role })
 */
const useTableData = (apiFn, extra = {}) => {
  const [data, setData]       = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [sortBy, setSortBy]   = useState("createdAt");
  const [order, setOrder]     = useState("desc");
  const [filters, setFilters] = useState({});

  const mounted = useRef(true);
  useEffect(() => () => { mounted.current = false; }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn({
        page,
        limit: DEFAULT_PAGE_SIZE,
        search,
        sortBy,
        order,
        ...filters,
        ...extra,
      });
      if (!mounted.current) return;
      // Both admin and user endpoints wrap in data.data
      const payload = res.data?.data;
      // Payload may contain { users, stores } + pagination
      const rows = payload?.users ?? payload?.stores ?? [];
      setData(rows);
      setPagination(payload?.pagination ?? { total: rows.length, page: 1, totalPages: 1 });
    } catch (err) {
      if (!mounted.current) return;
      setError(err?.response?.data?.message ?? err.message ?? "Failed to load data.");
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [apiFn, page, search, sortBy, order, filters]); // eslint-disable-line

  useEffect(() => { fetch(); }, [fetch]);

  const handleSort = (key, dir) => {
    setSortBy(key);
    setOrder(dir);
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  const handleFilter = (key, val) => {
    setFilters((prev) => ({ ...prev, [key]: val || undefined }));
    setPage(1);
  };

  return {
    data, pagination, loading, error,
    page, setPage,
    search, handleSearch,
    sortBy, order, handleSort,
    filters, handleFilter,
    refetch: fetch,
  };
};

export default useTableData;