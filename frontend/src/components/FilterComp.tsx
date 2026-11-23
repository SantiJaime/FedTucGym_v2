import { Bookmark, CircleUser, Search, Tag } from "lucide-react";
import { Button } from "./ui/Button";
import { cardTones } from "./ui/cardTones";
import { cn } from "../lib/utils";
import { OneTwoThreeIcon } from "./Icons";
import { CATEGORIES, LEVELS } from "../constants/const";
import {
  filterMembersValidatorSchema,
  type FilterMembers,
} from "../validation/filterMembersValidatorSchema";
import { useFormik } from "formik";
import { FormikInputComp, FormikSelectComp } from "./FormikInputComp";
import { toast } from "sonner";

interface Props {
  submitFilter: (paramFilters: FilterMembers) => void;
  color: ColorType;
  textColor: "white" | "dark";
  setFilters: React.Dispatch<React.SetStateAction<FilterMembers | null>>;
  setLoadingFilter: React.Dispatch<React.SetStateAction<boolean>>;
  gyms: User[] | null;
  user: UserInfo | null;
}

const FilterComp: React.FC<Props> = ({
  color,
  textColor,
  setFilters,
  submitFilter,
  setLoadingFilter,
  gyms,
  user,
}) => {
  const formik = useFormik({
    initialValues: {
      full_name: "",
      dni: "",
      id_category: 0,
      id_level: 0,
      id_gym: 0,
    },
    validationSchema: filterMembersValidatorSchema,
    onSubmit: (values) => {
      if (user && user.role === "Administrador" && values.id_gym === 0) {
        toast.error("Debe seleccionar un gimnasio");
        return;
      }
      setFilters(values);
      setLoadingFilter(false);
      submitFilter(values);
    },
  });

  const { values, errors, handleChange, handleSubmit } = formik;

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:grid-cols-4">
        <FormikInputComp
          controlId="FilterNameId"
          label="Nombre completo (o parcial)"
          placeholder="Ej: Juan"
          icon={<CircleUser size={18} />}
          value={values.full_name}
          onChange={handleChange}
          errors={errors.full_name}
          name="full_name"
        />
        <FormikInputComp
          controlId="FilterDniId"
          label="DNI completo"
          placeholder="Ej: 12345678"
          icon={<OneTwoThreeIcon />}
          value={values.dni}
          onChange={handleChange}
          errors={errors.dni}
          name="dni"
        />
        <FormikSelectComp
          controlId="FilterCategoryId"
          label="Categoría"
          options={CATEGORIES}
          icon={<Bookmark size={18} />}
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
        <FormikSelectComp
          controlId="FilterLevelId"
          label="Nivel"
          options={LEVELS}
          icon={<Tag size={18} />}
          value={values.id_level}
          onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
            handleChange({
              target: {
                name: "id_level",
                value: Number(ev.target.value),
              },
            });
          }}
          errors={errors.id_level}
          name="id_level"
        />
        {gyms && user && user.role === "Administrador" ? (
          <FormikSelectComp
            controlId="FilterGymId"
            label="Gimnasio"
            options={[
              { value: 0, label: "Sin seleccionar gimnasio" },
              ...gyms.map((gym) => ({
                value: gym.id,
                label: gym.full_name,
              })),
            ]}
            icon={<CircleUser size={18} />}
            value={values.id_gym}
            onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
              handleChange({
                target: {
                  name: "id_gym",
                  value: Number(ev.target.value),
                },
              });
            }}
            errors={errors.id_gym}
            name="id_gym"
          />
        ) : (
          ""
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={cn("rounded-xl p-3", cardTones[color], textColor === "white" ? "text-white" : "text-slate-900")}>
          <h6 className="underline">¡Importante!</h6>
          <p className="mt-1">
            Si desea obtener todos los alumnos, deje los campos en blanco y
            presione en <b>Filtrar 🔍</b>
          </p>
        </div>
        <Button
          type="submit"
          variant="dark"
          
        >
          <span>Filtrar</span>
          <Search size={18} />
        </Button>
      </div>
    </form>
  );
};

export default FilterComp;
