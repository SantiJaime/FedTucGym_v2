import { cn } from "../../lib/utils";

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <span
    role="status"
    aria-label="Cargando"
    className={cn(
      "inline-block size-6 animate-spin rounded-full border-2 border-current border-r-transparent",
      className,
    )}
  />
);
