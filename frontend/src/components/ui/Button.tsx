import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const buttonVariants = {
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

type ButtonVariant = keyof typeof buttonVariants;

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

export const Button: React.FC<Props> = ({
  variant = "dark",
  size = "md",
  type = "button",
  className,
  ...rest
}) => (
  <button
    type={type}
    className={cn(
      "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-lg font-medium transition-colors",
      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500",
      "disabled:pointer-events-none disabled:opacity-60",
      size === "sm" ? "px-2.5 py-1 text-sm" : "px-4 py-2",
      buttonVariants[variant],
      className,
    )}
    {...rest}
  />
);
