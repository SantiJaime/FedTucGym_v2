import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

const tones: Record<ColorType, string> = {
  primary: "bg-blue-700 text-white",
  secondary: "bg-slate-600 text-white",
  success: "bg-green-700 text-white",
  danger: "bg-red-700 text-white",
  warning: "bg-amber-300 text-slate-900",
  info: "bg-sky-300 text-slate-900",
  light: "bg-white text-slate-900",
  dark: "bg-brand-700 text-white",
};

interface Props extends HTMLAttributes<HTMLDivElement> {
  color?: ColorType;
}

export const Card: React.FC<Props> = ({ color = "light", className, ...rest }) => (
  <div
    className={cn("w-full max-w-xl overflow-hidden rounded-xl shadow-soft", tones[color], className)}
    {...rest}
  />
);
