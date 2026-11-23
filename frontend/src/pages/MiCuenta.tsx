import useUsers from "../hooks/useUsers";
import CardComp from "../components/CardComp";

export default function MiCuenta() {
  const { user } = useUsers();

  return (
    <div className="flex items-start justify-center px-4 pt-12">
      <CardComp user={user} color="success" textColor="white" />
    </div>
  );
}
