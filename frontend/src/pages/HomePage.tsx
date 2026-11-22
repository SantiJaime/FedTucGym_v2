import { ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useUsers from "../hooks/useUsers";

const ADMIN_OPTIONS = [
  { nombre: "MI CUENTA", ruta: "/mi-cuenta" },
  { nombre: "REGISTRAR USUARIO", ruta: "/crear-usuario" },
  { nombre: "ADMINISTRAR TORNEOS", ruta: "/admin-torneos" },
  { nombre: "ALUMNOS", ruta: "/alumnos" },
  { nombre: "HISTORIAL DE PUNTAJES", ruta: "/historial-puntajes" },
];

const GYM_OPTIONS = [
  {
    nombre: "MI CUENTA",
    ruta: "/mi-cuenta",
  },
  {
    nombre: "ALUMNOS",
    ruta: "/alumnos",
  },
  {
    nombre: "INSCRIPCIÓN TORNEOS",
    ruta: "/inscripcion-torneos",
  },
  {
    nombre: "HISTORIAL DE PUNTAJES",
    ruta: "/historial-puntajes",
  },
];

const JUEZ_OPTIONS = [
  {
    nombre: "MI CUENTA",
    ruta: "/mi-cuenta",
  },
  {
    nombre: "PUNTAJES",
    ruta: "/puntajes",
  },
  {
    nombre: "HISTORIAL DE PUNTAJES",
    ruta: "/historial-puntajes",
  },
];

const OPTIONS_BY_ROLE: Record<string, typeof ADMIN_OPTIONS> = {
  Administrador: ADMIN_OPTIONS,
  Gimnasio: GYM_OPTIONS,
  Juez: JUEZ_OPTIONS,
};

const Menu = () => {
  const navigate = useNavigate();

  const { user } = useUsers();
  const options = (user && OPTIONS_BY_ROLE[user.role]) || [];

  return (
    <div
      className="d-flex flex-column align-items-center justify-content-center"
      style={{ height: "65vh" }}
    >
      <ListGroup
        variant="flush"
        className="rounded-4 bg-white py-2 overflow-hidden"
        style={{ width: "50%", maxWidth: 800 }}
      >
        {options.map((opcion) => (
          <ListGroup.Item
            key={opcion.ruta}
            action
            onClick={() => navigate(opcion.ruta)}
            className="text-center fw-bold border-0 py-2"
          >
            {opcion.nombre}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Menu;
