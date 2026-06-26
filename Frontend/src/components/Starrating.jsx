// StarRating — used in two modes:
//   readOnly: just display filled/empty stars
//   interactive: hover highlight + click to pick

const SIZE = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-2xl",
};

export default function StarRating({
  value = 0,
  onChange,
  onHover,
  readOnly = false,
  size = "md",
  max = 5,
}) {
  const sizeClass = SIZE[size] || SIZE.md;

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? undefined : "group"}>
      {Array.from({ length: max }, (_, i) => {
        const starVal = i + 1;
        const filled = starVal <= value;

        return (
          <span
            key={i}
            className={[
              sizeClass,
              "leading-none select-none transition-colors",
              readOnly
                ? filled
                  ? "text-amber-400"
                  : "text-slate-200"
                : [
                    "cursor-pointer",
                    filled ? "text-amber-400" : "text-slate-300",
                    "hover:text-amber-400",
                  ].join(" "),
            ].join(" ")}
            onClick={!readOnly ? () => onChange?.(starVal) : undefined}
            onMouseEnter={!readOnly ? () => onHover?.(starVal) : undefined}
            onMouseLeave={!readOnly ? () => onHover?.(0) : undefined}
            role={!readOnly ? "button" : undefined}
            aria-label={!readOnly ? `Rate ${starVal} out of ${max}` : undefined}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}