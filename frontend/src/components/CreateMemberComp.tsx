import { useState } from "react";
import { CalendarDays, CircleUser, Tag, UserPlus } from "lucide-react";
import { Button } from "./ui/Button";
import { Modal } from "./ui/Modal";
import useMembers from "../hooks/useMembers";
import { createMemberValidatorSchema } from "../validation/createMemberValidatorSchema";
import { OneTwoThreeIcon } from "./Icons";
import { useFormik } from "formik";
import { FormikInputComp, FormikSelectComp } from "./FormikInputComp";
import { LEVELS } from '../constants/const';

interface Props {
  member?: FullMemberInfo;
  onClose?: () => void;
}

// Con `member` se monta ya abierto: la página renderiza un único modal de edición.
const CreateMemberComp: React.FC<Props> = ({ member, onClose }) => {
  const { handleCreateMember, handleUpdateMember } = useMembers();
  const [show, setShow] = useState(!!member);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const formik = useFormik({
    initialValues: {
      full_name: member?.full_name ?? "",
      birth_date: member?.birth_date ?? "",
      dni: member?.dni.toString() ?? "",
      id_level: member?.id_level ?? 0,
    },
    validationSchema: createMemberValidatorSchema,
    onSubmit: async (values) => {
      if (member) {
        const res = await handleUpdateMember(member.id, values);
        if (res?.member) {
          handleClose();
        }
        return;
      }

      const res = await handleCreateMember(values);
      if (res?.member) {
        resetForm({
          values: {
            full_name: "",
            birth_date: "",
            dni: "",
            id_level: 0,
          },
        });
        handleClose();
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

  return (
    <>
      {!member && (
        <Button
          variant="danger"
          onClick={handleShow}
        >
          <UserPlus size={18} />
          <span>Crear alumno</span>
        </Button>
      )}

      <Modal show={show} onHide={handleClose} onExited={onClose} title={member ? "Editar alumno" : "Crear alumno"}>
          <form onSubmit={handleSubmit}>
            <FormikInputComp
              controlId="MemberFullNameId"
              label="Nombre completo"
              placeholder="Ej: Juan Perez"
              icon={<CircleUser size={18} />}
              onChange={handleChange}
              value={values.full_name}
              errors={errors.full_name}
              name="full_name"
            />
            <FormikInputComp
              controlId="MemberBirthDateId"
              label="Fecha de nacimiento"
              type="date"
              placeholder="YYYY-MM-DD"
              icon={<CalendarDays size={18} />}
              value={values.birth_date}
              name="birth_date"
              errors={errors.birth_date}
              onChange={handleChange}
            />
            <FormikInputComp
              controlId="MemberDniId"
              label="DNI"
              placeholder="Ej: 12345678"
              icon={<OneTwoThreeIcon />}
              value={values.dni}
              onChange={handleChange}
              name="dni"
              errors={errors.dni}
            />
            <FormikSelectComp
              label="Nivel"
              options={LEVELS}
              controlId="MemberLevelId"
              icon={<Tag size={18} />}
              errors={errors.id_level}
              value={values.id_level}
              onChange={(ev: React.ChangeEvent<HTMLSelectElement>) => {
                handleChange({
                  target: {
                    name: "id_level",
                    value: Number(ev.target.value),
                  },
                });
              }}
              name="id_level"
            />

            <Button variant="dark" type="submit" className="w-full">
              {member ? "Guardar cambios" : "Crear alumno"}
            </Button>
          </form>
      </Modal>
    </>
  );
};

export default CreateMemberComp;
