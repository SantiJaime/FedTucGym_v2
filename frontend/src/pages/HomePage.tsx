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
    <div className="flex h-[65vh] flex-col items-center justify-center px-4">
      <div className="w-full max-w-[800px] overflow-hidden rounded-2xl bg-white py-2 shadow-soft md:w-1/2">
        {options.map((opcion) => (
          <button
            key={opcion.ruta}
            type="button"
            onClick={() => navigate(opcion.ruta)}
            className="block w-full cursor-pointer px-4 py-2 text-center font-bold transition-colors hover:bg-brand-100 focus-visible:bg-brand-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-500"
          >
            {opcion.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Menu;
