const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  // Show max 5 page buttons around current page
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const withEllipsis = [];
  visible.forEach((p, i) => {
    if (i > 0 && p - visible[i - 1] > 1) withEllipsis.push("…");
    withEllipsis.push(p);
  });

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <PageBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} aria-label="Previous">
        ‹
      </PageBtn>

      {withEllipsis.map((p, i) =>
        p === "…" ? (
          <span key={`e${i}`} className="px-2 py-1 text-slate-400 text-sm">…</span>
        ) : (
          <PageBtn
            key={p}
            active={p === page}
            onClick={() => onPageChange(p)}
          >
            {p}
          </PageBtn>
        )
      )}

      <PageBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages} aria-label="Next">
        ›
      </PageBtn>
    </div>
  );
};

const PageBtn = ({ children, active, disabled, ...props }) => (
  <button
    disabled={disabled}
    className={`
      min-w-[2rem] h-8 px-2 rounded-lg text-sm font-medium transition-colors
      ${active ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}
      disabled:opacity-40 disabled:cursor-not-allowed
    `}
    {...props}
  >
    {children}
  </button>
);

export default Pagination;