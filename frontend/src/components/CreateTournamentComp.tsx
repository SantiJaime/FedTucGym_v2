import { useFormik } from "formik";
import { useState } from "react";
import { CalendarDays, CirclePlus, Tag } from "lucide-react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import { FormikInputComp } from "./FormikInputComp";
import { createTournamentValidatorSchema } from "../validation/createTournamentValidatorSchema";
import { validateDates } from "../utils/extraFunctions";
import { toast } from "sonner";
import useTournaments from "../hooks/useTournaments";

const CreateTournamentComp = () => {
  const { handleCreateTournament } = useTournaments();

  const formik = useFormik({
    initialValues: {
      name: "",
      startDate: "",
      endDate: "",
      inscription_date_end: ""
    },
    validationSchema: createTournamentValidatorSchema,
    onSubmit: async (values) => {
      const areDatesValid = validateDates(values.startDate, values.endDate, values.inscription_date_end);
      if (!areDatesValid) {
        toast.error(
          "La fecha de finalización debe ser igual o posterior a la fecha de inicio y el último día de inscripción menor al inicio"
        );
        return;
      }

      const res = await handleCreateTournament(values);
      if (res) {
        handleClose();
        resetForm();
      }
    },
  });

  const {
    values,
    errors,
    handleChange,
    handleSubmit,
    resetForm,
  } = formik;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  return (
    <>
      <Button
        variant="secondary"
        onClick={handleShow}
      >
        <CirclePlus size={18} />
        <span>Crear torneo</span>
      </Button>
      <Modal show={show} onHide={handleClose} title="Crear nuevo torneo">
          <form onSubmit={handleSubmit}>
            <FormikInputComp
              controlId="TournamentNameId"
              label="Nombre del torneo"
              placeholder="Ej: Torneo de invierno 2025"
              icon={<Tag size={18} />}
              value={values.name}
              onChange={handleChange}
              errors={errors.name}
              name="name"
            />
            <FormikInputComp
              controlId="TournamentStartDateId"
              label="Fecha de inicio"
              type="date"
              placeholder="YYYY-MM-DD"
              icon={<CalendarDays size={18} />}
              value={values.startDate}
              onChange={handleChange}
              errors={errors.startDate}
              name="startDate"
            />
            <FormikInputComp
              controlId="TournamentEndDateId"
              label="Fecha de finalización"
              type="date"
              placeholder="YYYY-MM-DD"
              icon={<CalendarDays size={18} />}
              value={values.endDate}
              onChange={handleChange}
              errors={errors.endDate}
              name="endDate"
            />
            <FormikInputComp
              controlId="InscriptionEndDateId"
              label="Último día para inscribirse"
              type="date"
              placeholder="YYYY-MM-DD"
              icon={<CalendarDays size={18} />}
              value={values.inscription_date_end}
              onChange={handleChange}
              errors={errors.inscription_date_end}
              name="inscription_date_end"
            />
            <Button variant="dark" type="submit" className="w-full">
              Crear torneo
            </Button>
          </form>
      </Modal>
    </>
  );
};

export default CreateTournamentComp;
