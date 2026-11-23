import { useState, type ReactNode } from "react";
import type { UseFormRegisterReturn, UseFormSetValue } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import type { LoginFormData } from "../validation/loginValidatorSchema";
import { Field, Input } from "./ui/Field";
import { Button } from "./ui/Button";

interface Props {
  controlId: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: ReactNode;
  register: UseFormRegisterReturn;
  error?: string;
  onChange?: (ev: React.ChangeEvent<HTMLInputElement>) => void;
  value?: string;
  autoComplete?: string;
  setValue?: UseFormSetValue<LoginFormData>;
  name?: string;
}

const InputComp: React.FC<Props> = ({
  controlId,
  label,
  type = "text",
  placeholder,
  icon,
  register,
  error,
  onChange,
  value,
  autoComplete,
  setValue,
  name,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;
  return (
    <Field
      id={controlId}
      label={label}
      icon={icon}
      error={error}
      end={
        isPassword && (
          <Button
            variant="outline-secondary"
            onClick={() => setShowPassword((prevState) => !prevState)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="rounded-none border-0 border-l"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )
      }
    >
      <Input
        id={controlId}
        placeholder={placeholder}
        type={inputType}
        {...register}
        aria-invalid={!!error}
        onChange={onChange}
        value={value}
        autoComplete={autoComplete}
        name={name}
        onInput={(ev) => setValue?.(name as keyof LoginFormData, ev.currentTarget.value)}
      />
    </Field>
  );
};

export default InputComp;
