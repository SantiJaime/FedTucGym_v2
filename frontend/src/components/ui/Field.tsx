import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const control =
  "block w-full min-w-0 flex-1 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:bg-slate-100";

interface FieldProps {
  id: string;
  label: string;
  icon?: ReactNode;
  error?: string;
  /** Contenido extra al final del grupo (p. ej. botón mostrar contraseña) */
  end?: ReactNode;
  className?: string;
  children: ReactNode;
}

/** Equivale a Form.Group + Form.Label + InputGroup + mensaje de error */
export const Field: React.FC<FieldProps> = ({ id, label, icon, error, end, className, children }) => (
  <div className={cn("mb-3", className)}>
    <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
      {label}
    </label>
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-lg border bg-white focus-within:ring-2 focus-within:ring-accent-500",
        error ? "border-red-600" : "border-slate-300",
      )}
    >
      {icon && (
        <span className="flex items-center border-r border-slate-300 bg-slate-100 px-3 text-slate-600">
          {icon}
        </span>
      )}
      {children}
      {end}
    </div>
    {error && <small className="text-red-600">{error}</small>}
  </div>
);

export const Input: React.FC<InputHTMLAttributes<HTMLInputElement>> = ({ className, ...rest }) => (
  <input className={cn(control, className)} {...rest} />
);

export const Select: React.FC<SelectHTMLAttributes<HTMLSelectElement>> = ({ className, ...rest }) => (
  <select className={cn(control, className)} {...rest} />
);
