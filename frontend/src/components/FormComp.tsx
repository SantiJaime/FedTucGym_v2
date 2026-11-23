import React from "react";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import InputComp from "./InputComp";
import { AtSign, CircleUser, Lock } from "lucide-react";
import {
  type FieldErrors,
  type SubmitHandler,
  type UseFormHandleSubmit,
  type UseFormRegister,
  type UseFormSetValue,
} from "react-hook-form";
import type { RegisterFormData } from "../validation/registerValidatorSchema";
import type { LoginFormData } from "../validation/loginValidatorSchema";
import { FormikInputComp, FormikSelectComp } from "./FormikInputComp";
import type { FormikErrors, FormikHandlers } from "formik";

interface LoginProps {
  register: UseFormRegister<LoginFormData>;
  errors: FieldErrors<LoginFormData>;
  handleSubmit: UseFormHandleSubmit<LoginFormData>;
  onSubmit: SubmitHandler<LoginFormData>;
  loading?: boolean;
  setValue?: UseFormSetValue<LoginFormData>;
}

interface RegisterProps {
  errors: FormikErrors<RegisterFormData>;
  values: RegisterFormData;
  handleSubmit: FormikHandlers["handleSubmit"];
  handleChange: FormikHandlers["handleChange"];
  loading?: boolean;
}

const FORM_CLASS = "mt-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft";

const loadingSpinner = (
  <div className="flex items-center justify-center gap-2">
    <Spinner className="size-4" />
    <span>Cargando...</span>
  </div>
);

export const RegisterFormComp: React.FC<RegisterProps> = ({
  errors,
  handleSubmit,
  loading,
  handleChange,
  values,
}) => {
  const ROLES_OPTIONS = [
    { label: "Sin seleccionar rol", value: 0 },
    { label: "Administrador", value: 1 },
    { label: "Juez", value: 2 },
    { label: "Gimnasio", value: 3 },
  ];
  const CATEGORIES_OPTIONS = [
    { label: "Sin categoría", value: 1 },
    { label: "Activo", value: 2 },
    { label: "Adherente", value: 3 },
  ];
  return (
    <form onSubmit={handleSubmit} className={FORM_CLASS}>
      <h5 className="text-lg font-semibold">Crear una nueva cuenta</h5>
      <hr className="my-3 border-slate-200" />
      <FormikInputComp
        controlId="FullNameId"
        label="Nombre completo"
        placeholder="Ej: Juan Pérez"
        icon={<CircleUser size={18} />}
        value={values.full_name}
        onChange={handleChange}
        name="full_name"
        errors={errors.full_name}
      />
      <FormikInputComp
        controlId="RegisterPasswordId"
        label="Contraseña"
        placeholder="************"
        type="password"
        icon={<Lock size={18} />}
        value={values.password}
        onChange={handleChange}
        errors={errors.password}
        name="password"
      />
      <FormikSelectComp
        controlId="RegisterRoleId"
        options={ROLES_OPTIONS}
        label="Rol del usuario"
        icon={<CircleUser size={18} />}
        value={values.id_role}
        onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
          handleChange({
            target: {
              name: "id_role",
              value: Number(ev.target.value),
            },
          });
        }}
        errors={errors.id_role}
        name="id_role"
      />
      {values.id_role === 3 && (
        <FormikSelectComp
          controlId="RegisterCategoryId"
          options={CATEGORIES_OPTIONS}
          label="Categoría del gimnasio"
          icon={<CircleUser size={18} />}
          value={values.id_category}
          onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
            handleChange({
              target: {
                name: "id_category",
                value: Number(ev.target.value),
              },
            });
          }}
          errors={errors.id_category}
          name="id_category"
        />
      )}
      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={loading}>
          {loading ? loadingSpinner : "Crear cuenta"}
        </Button>
      </div>
    </form>
  );
};
export const LoginFormComp: React.FC<LoginProps> = ({
  register,
  errors,
  handleSubmit,
  loading,
  onSubmit,
  setValue,
}) => {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className={FORM_CLASS}>
      <h5 className="text-lg font-semibold">Iniciar sesión</h5>
      <hr className="my-3 border-slate-200" />
      <InputComp
        controlId="LoginFullnameId"
        label="Nombre completo"
        placeholder="Juan Pérez"
        icon={<AtSign size={18} />}
        register={register("full_name")}
        error={errors.full_name?.message}
        autoComplete="full_name"
        setValue={setValue}
        name="full_name"
      />
      <InputComp
        controlId="LoginPasswordId"
        label="Contraseña"
        placeholder="************"
        type="password"
        icon={<Lock size={18} />}
        register={register("password")}
        error={errors.password?.message}
        autoComplete="current-password"
        setValue={setValue}
        name="password"
      />
      <div className="flex justify-end">
        <Button type="submit" variant="dark" disabled={loading}>
          {loading ? loadingSpinner : "Iniciar sesión"}
        </Button>
      </div>
    </form>
  );
};
