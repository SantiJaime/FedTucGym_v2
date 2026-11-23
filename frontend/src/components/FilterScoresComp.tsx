import { Bookmark, Search, Tag } from "lucide-react";
import { Button } from "./ui/Button";
import { CATEGORIES, LEVELS } from "../constants/const";
import { useFormik } from "formik";
import { FormikSelectComp } from "./FormikInputComp";
import {
  filterScoresValidatorSchema,
  type FilterScores,
} from "../validation/filterScoresValidatorSchema";

interface Props {
  submitFilter: (values: FilterScores) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterScores | null>>
}

const FilterScoresComp: React.FC<Props> = ({ submitFilter, setFilters }) => {
  const formik = useFormik({
    initialValues: {
      id_category: 0,
      id_level: 0,
    },
    validationSchema: filterScoresValidatorSchema,
    onSubmit: (values) => {
      setFilters(values);
      submitFilter(values);
    },
  });

  const { values, errors, handleSubmit, setFieldValue } = formik;

  return (
    <form onSubmit={handleSubmit} className="my-3">
      <div>
        <h5 className="text-lg font-semibold">Filtrar alumnos por categoría y nivel</h5>
        <hr className="my-3 border-slate-200" />
      </div>
      <div className="grid grid-cols-1 gap-x-3 sm:grid-cols-2 md:mx-auto md:max-w-2xl">
        <FormikSelectComp
          controlId="FilterCategoryId"
          label="Categoría"
          options={CATEGORIES}
          icon={<Bookmark size={18} />}
          value={values.id_category}
          onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
            setFieldValue("id_category", Number(ev.target.value));
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
            setFieldValue("id_level", Number(ev.target.value));
          }}
          errors={errors.id_level}
          name="id_level"
        />
      </div>
      <div className="flex justify-end">
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

export default FilterScoresComp;
