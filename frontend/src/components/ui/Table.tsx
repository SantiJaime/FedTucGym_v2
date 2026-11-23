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
        // En mobile cada fila se muestra como una tarjeta: el encabezado pasa a etiqueta de cada celda (data-label)
        "max-sm:[&_thead]:sr-only max-sm:[&_tr]:block max-sm:[&_tbody_tr]:border-b-4 max-sm:[&_tbody_tr]:border-slate-200",
        "max-sm:[&_td]:flex max-sm:[&_td]:items-center max-sm:[&_td]:justify-between max-sm:[&_td]:gap-3 max-sm:[&_td]:text-right",
        "max-sm:[&_td]:before:text-left max-sm:[&_td]:before:font-semibold max-sm:[&_td]:before:text-slate-600 max-sm:[&_td]:before:content-[attr(data-label)]",
        className,
      )}
      {...rest}
    />
  </div>
);
