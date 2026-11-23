import { yupResolver } from "@hookform/resolvers/yup";
import { Spinner } from "../components/ui/Spinner";
import { loginValidatorSchema, type LoginFormData } from "../validation/loginValidatorSchema";
import { useForm } from "react-hook-form";
import { LoginFormComp } from "../components/FormComp";
import useUsers from "../hooks/useUsers";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const LoginPage = () => {
  const navigate = useNavigate();

  const { handleLogin, loading, user, isInitializing } = useUsers();

  useEffect(() => {
    if (!isInitializing && user) {
      navigate("/inicio");
    }
  }, [user, navigate, isInitializing]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginValidatorSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const res = await handleLogin(data);
    if (res?.userInfo) {
      navigate("/inicio");
    }
  };

  if (isInitializing) {
    return (
      <div className="my-12 flex justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="mx-auto my-12 flex max-w-7xl flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center justify-center text-center">
        <img src="/logo_negro.png" alt="Logo de torneos" width={300} className="max-w-full" />
        <h3 className="text-2xl font-semibold">Administración de torneos - Federación Tucumana de Gimnasia</h3>
      </div>
      <div className="w-full md:w-3/4">
        <LoginFormComp
          register={register}
          errors={errors}
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          loading={loading}
          setValue={setValue}
        />
      </div>
    </div>
  );
};

export default LoginPage;
