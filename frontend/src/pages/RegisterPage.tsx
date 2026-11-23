import { registerValidatorSchema} from "../validation/registerValidatorSchema";
import { RegisterFormComp } from "../components/FormComp";
import useUsers from "../hooks/useUsers";
import { toast } from "sonner";
import { useFormik } from 'formik';

const RegisterPage = () => {
  const { handleCreateUser } = useUsers();

  const formik = useFormik({
    initialValues: {
      full_name: "",
      password: "",
      id_role: 0,
      id_category: 1,
    },
    validationSchema: registerValidatorSchema,
    onSubmit: async (values) => {
      const res = await handleCreateUser(values);
      if (res?.user) {
        toast.success(res.message);
        resetForm();
      }
    },
  })

  const { values, errors, handleChange, handleSubmit, resetForm } = formik;

  return (
    <div className="mx-auto my-12 flex max-w-7xl flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center justify-center text-center">
        <img src="/logo_negro.png" alt="Logo de torneos" width={300} className="max-w-full" />
        <h3 className="text-2xl font-semibold">Administración de torneos - Federación Tucumana de Gimnasia</h3>
      </div>
      <div className="w-full md:w-3/4">
        <RegisterFormComp
          errors={errors}
          handleSubmit={handleSubmit}
          values={values}
          handleChange={handleChange}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
