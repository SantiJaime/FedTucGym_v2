import React from "react";
import { Button } from "./ui/Button";
import { Spinner } from "./ui/Spinner";
import { buttonClasses } from "./ui/buttonStyles";
import { NavLink } from "react-router-dom";

interface Props {
  user: UserInfo | null;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  logOutLoading: boolean;
}

const NavLinks: React.FC<Props> = ({ user, logout, isLoggedIn, logOutLoading }) => {
  const LOGGED_USER_NAVS = [
    {
      to: "/inicio",
      text: "Inicio",
    },
    {
      to: "/mi-cuenta",
      text: "Mi cuenta",
    },
  ];

  if (!user) {
    return (
      <NavLink to="/" className={buttonClasses("outline-light")}>
        Iniciar sesión
      </NavLink>
    );
  }
  const spinner = (
    <div className="flex items-center gap-2">
      <Spinner className="size-4" />
      <span>Cerrando sesión...</span>
    </div>
  )
  return (
    <>
      {isLoggedIn && user.userId > 0 ? (
        <>
          {LOGGED_USER_NAVS.map((nav, index) => (
            <NavLink
              key={index}
              to={nav.to}
              className={({ isActive }) =>
                buttonClasses("outline-light", "md", isActive ? "bg-white text-brand-700" : undefined)
              }
            >
              {nav.text}
            </NavLink>
          ))}
          <Button onClick={logout} variant="outline-light" disabled={logOutLoading}>
            {logOutLoading ? spinner : "Cerrar sesión"}
          </Button>
        </>
      ) : (
        ""
      )}
    </>
  );
};

export default NavLinks;
