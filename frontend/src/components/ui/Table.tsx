import type { TableHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

/** Tabla con scroll horizontal; se usa con thead/tbody/tr/th/td nativos */
export const Table: React.FC<TableHTMLAttributes<HTMLTableElement>> = ({ className, ...rest }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-slate-200 bg-white">
    <table
      className={cn(
        "w-full text-left text-sm",
        "[&_th]:bg-brand-50 [&_th]:px-3 [&_th]:py-2 [&_th]:font-semibold [&_th]:text-slate-700",
        "[&_td]:px-3 [&_td]:py-2 [&_tr]:border-b [&_tr]:border-slate-200",
        "[&_tbody_tr:nth-child(even)]:bg-slate-50 [&_tbody_tr:hover]:bg-slate-100",
        className,
      )}
      {...rest}
    />
  </div>
);
