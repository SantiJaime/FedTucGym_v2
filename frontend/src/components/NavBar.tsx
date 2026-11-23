import { NavLink } from "react-router-dom";
import useUsers from "../hooks/useUsers";
import NavLinks from "./NavLinks";

function NavbarComp() {
  const { handleLogout, user, isLoggedIn, logOutLoading } = useUsers();

  const logout = async () => {
    await handleLogout();
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 bg-brand-700 shadow-soft">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-4 py-2">
        <NavLink to="/HomePage" className="text-white">
          <img src="/logo_blanco.png" alt="Logo de torneos" width={50} />
        </NavLink>
        <div className="flex gap-3">
          <NavLinks user={user} isLoggedIn={isLoggedIn} logout={logout} logOutLoading={logOutLoading} />
        </div>
      </nav>
    </header>
  );
}

export default NavbarComp;
