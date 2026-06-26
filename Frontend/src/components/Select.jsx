import { forwardRef } from "react";

const Select = forwardRef(({ label, error, options = [], placeholder, className = "", ...props }, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-slate-700">{label}</label>
    )}
    <select
      ref={ref}
      className={`
        w-full px-3 py-2.5 rounded-lg border text-sm text-slate-900
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
        disabled:bg-slate-50 transition-colors bg-white
        ${error ? "border-red-400 bg-red-50" : "border-slate-300"}
        ${className}
      `}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(({ value, label }) => (
        <option key={value} value={value}>{label}</option>
      ))}
    </select>
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
));

Select.displayName = "Select";
export default Select;