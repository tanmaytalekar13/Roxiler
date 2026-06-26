import Spinner from "./Spinner";
import EmptyState from "./EmptyState";

/**
 * columns: [{ key, label, sortable, render }]
 */
const DataTable = ({
  columns,
  data = [],
  loading,
  sortBy,
  order,
  onSort,
  emptyTitle,
  emptyDescription,
}) => {
  const handleSort = (key) => {
    if (!onSort) return;
    if (sortBy === key) {
      onSort(key, order === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "asc");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`
                  text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap
                  ${col.sortable ? "cursor-pointer select-none hover:text-slate-800 transition-colors" : ""}
                `}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                <span className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && (
                    <SortIcon active={sortBy === col.key} order={order} />
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row, i) => (
            <tr key={row.id ?? i} className="hover:bg-slate-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-700">
                  {col.render ? col.render(row) : row[col.key] ?? "—"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const SortIcon = ({ active, order }) => (
  <span className={`flex flex-col ${active ? "text-indigo-600" : "text-slate-400"}`}>
    <svg className={`w-3 h-3 -mb-1 ${active && order === "asc" ? "opacity-100" : "opacity-40"}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 4l8 8H4z" />
    </svg>
    <svg className={`w-3 h-3 ${active && order === "desc" ? "opacity-100" : "opacity-40"}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 20l-8-8h16z" />
    </svg>
  </span>
);

export default DataTable;