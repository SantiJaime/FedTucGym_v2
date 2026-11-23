import type { ButtonHTMLAttributes } from "react";
import { buttonClasses, type ButtonVariant } from "./buttonStyles";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md";
}

export const Button: React.FC<Props> = ({ variant, size, type = "button", className, ...rest }) => (
  <button type={type} className={buttonClasses(variant, size, className)} {...rest} />
);
