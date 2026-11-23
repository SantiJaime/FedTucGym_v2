import { Spinner } from "../components/ui/Spinner";
import CreateTournamentComp from "../components/CreateTournamentComp";
import useTournaments from "../hooks/useTournaments";
import { TournamentsTableComp } from "../components/TableComp";
import Swal from "sweetalert2";

const AdministrarTorneos = () => {
  const { tournaments, handleDeleteTournament, loading } = useTournaments();

  const deleteTournament = (id: number) => {
    Swal.fire({
      title: "¿Está seguro de eliminar este torneo?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#15803d",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleDeleteTournament(id);
      }
    });
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-7xl px-4 pb-8">
      <div className="flex justify-between">
        <h2 className="text-2xl font-semibold">Administrar torneos</h2>
        <CreateTournamentComp />
      </div>
      <p className="my-2">
        Aquí se mostrarán todos los torneos próximos y los nuevos que se vayan
        creando
      </p>
      <hr className="my-4 border-slate-300" />
      {loading ? (
        <div className="flex justify-center gap-2">
          <Spinner />
          <h4 className="text-lg font-semibold">Cargando...</h4>
        </div>
      ) : !tournaments || tournaments.length === 0 ? (
        <h3 className="text-xl font-semibold">No existen torneos próximos</h3>
      ) : (
        <TournamentsTableComp
          tournaments={tournaments}
          headers={[
            "Nombre",
            "Fecha de inicio | Fecha de fin",
            "Último día de inscripción",
            "Eliminar",
          ]}
          onClickDelete={deleteTournament}
        />
      )}
    </div>
  );
};

export default AdministrarTorneos;
