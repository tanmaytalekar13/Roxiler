export default function SortHeader({ label, col, sortBy, order, onSort }) {
  const active = sortBy === col;
  return (
    <th
      className="px-6 py-3 text-left cursor-pointer select-none whitespace-nowrap group"
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span
          className={`text-xs transition-opacity ${
            active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
          }`}
        >
          {active ? (order === "asc" ? "↑" : "↓") : "↕"}
        </span>
      </span>
    </th>
  );
}