import type { FormikHandlers } from "formik";
import type { ReactNode } from "react";
import { Field, Input, Select } from "./ui/Field";

interface InputProps {
  controlId: string;
  label: string;
  type?: string;
  placeholder: string;
  icon: ReactNode;
  value: string | number;
  errors?: string;
  onChange: FormikHandlers["handleChange"];
  name: string;
}

interface SelectProps {
  label: string;
  options: Option[];
  controlId: string;
  errors?: string;
  icon: ReactNode;
  value: number;
  onChange: FormikHandlers["handleChange"];
  name: string;
}

export const FormikInputComp: React.FC<InputProps> = ({
  controlId,
  label,
  type = "text",
  placeholder,
  icon,
  errors,
  onChange,
  value,
  name,
}) => (
  <Field id={controlId} label={label} icon={icon} error={errors}>
    <Input
      id={controlId}
      placeholder={placeholder}
      type={type}
      aria-invalid={!!errors}
      onChange={onChange}
      value={value}
      name={name}
    />
  </Field>
);

export const FormikSelectComp: React.FC<SelectProps> = ({
  label,
  options,
  controlId,
  errors,
  icon,
  value,
  onChange,
  name,
}) => (
  <Field id={controlId} label={label} icon={icon} error={errors}>
    <Select id={controlId} value={value} aria-invalid={!!errors} onChange={onChange} name={name}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  </Field>
);
