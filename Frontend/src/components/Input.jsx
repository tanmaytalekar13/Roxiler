import { forwardRef } from "react";

const Input = forwardRef(({ label, error, hint, className = "", ...props }, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
    )}
    <input
      ref={ref}
      className={`
        w-full px-3 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        disabled:bg-slate-50 disabled:text-slate-500
        transition-colors
        ${error ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"}
        ${className}
      `}
      {...props}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
));

Input.displayName = "Input";
export default Input;