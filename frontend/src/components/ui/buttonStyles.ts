import { cn } from "../../lib/utils";

const variants = {
  dark: "bg-brand-700 text-white hover:bg-brand-900",
  secondary: "bg-slate-600 text-white hover:bg-slate-700",
  danger: "bg-red-600 text-white hover:bg-red-700",
  success: "bg-green-700 text-white hover:bg-green-800",
  warning: "bg-amber-400 text-slate-900 hover:bg-amber-500",
  info: "bg-sky-400 text-slate-900 hover:bg-sky-500",
  light: "bg-white text-slate-900 border border-slate-200 hover:bg-slate-100",
  "outline-light": "border border-white/70 text-white hover:bg-white hover:text-brand-700",
  "outline-secondary": "border border-slate-300 text-slate-600 hover:bg-slate-100",
} as const;

export type ButtonVariant = keyof typeof variants;

export const buttonClasses = (variant: ButtonVariant = "dark", size: "sm" | "md" = "md", className?: string) =>
  cn(
    "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
    "disabled:pointer-events-none disabled:opacity-60",
    size === "sm" ? "px-2.5 py-1 text-sm" : "px-4 py-2",
    variants[variant],
    className,
  );
