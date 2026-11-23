import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import useUsers from "../hooks/useUsers";
import NavLinks from "./NavLinks";

function NavbarComp() {
  const { handleLogout, user, isLoggedIn, logOutLoading } = useUsers();

  const [open, setOpen] = useState(false);

  const logout = async () => {
    await handleLogout();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-brand-700 shadow-soft">
      <nav className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <NavLink to="/inicio" className="text-white">
          <img src="/logo_blanco.png" alt="Logo de torneos" width={50} />
        </NavLink>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="menu-principal"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="cursor-pointer rounded-lg p-2 text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white sm:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
        {/* En mobile el menú se despliega; al elegir una opción se cierra */}
        <div
          id="menu-principal"
          onClick={() => setOpen(false)}
          className={cn(
            "w-full flex-col gap-2 max-sm:*:w-full sm:flex sm:w-auto sm:flex-row sm:gap-3",
            open ? "flex" : "hidden",
          )}
        >
          <NavLinks user={user} isLoggedIn={isLoggedIn} logout={logout} logOutLoading={logOutLoading} />
        </div>
      </nav>
    </header>
  );
}

export default NavbarComp;
