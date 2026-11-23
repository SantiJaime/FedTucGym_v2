import type { ReactNode } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { Field, Select } from "./ui/Field";

interface Props {
  options: Option[];
  controlId: string;
  label: string;
  icon: ReactNode;
  register: UseFormRegisterReturn;
  error?: string;
}

const SelectComp: React.FC<Props> = ({ label, options, controlId, error, icon, register }) => {
  return (
    <Field id={controlId} label={label} icon={icon} error={error}>
      <Select id={controlId} {...register} aria-invalid={!!error}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </Field>
  );
};

export default SelectComp;
