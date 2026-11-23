import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { cardTones } from "./cardTones";


interface Props extends HTMLAttributes<HTMLDivElement> {
  color?: ColorType;
}

export const Card: React.FC<Props> = ({ color = "light", className, ...rest }) => (
  <div
    className={cn("w-full max-w-xl overflow-hidden rounded-xl shadow-soft", cardTones[color], className)}
    {...rest}
  />
);
