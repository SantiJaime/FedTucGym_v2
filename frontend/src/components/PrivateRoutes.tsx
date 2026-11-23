import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { Spinner } from "./ui/Spinner";
import { useUserContext } from "../hooks/useUserContext";

interface Props {
  children: ReactNode;
  role: UserRole[];
}
const PrivateRoutes: React.FC<Props> = ({ children, role }) => {
  const { user, isInitializing } = useUserContext();

  if (isInitializing) {
    return (
      <div className="my-12 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (!role.includes(user.role)) {
    return <Navigate to="/inicio" />;
  }

  return children;
};

export default PrivateRoutes;
