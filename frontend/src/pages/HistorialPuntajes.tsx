import useUsers from "../hooks/useUsers";
import CardComp from "../components/CardComp";
import useTournaments from "../hooks/useTournaments";
import { Button } from "../components/ui/Button";
import { OneTwoThreeIcon } from "../components/Icons";
import useScores from "../hooks/useScores";
import SelectTournamentComp from "../components/SelectTournamentComp";
import { useState } from "react";
import { toast } from "sonner";

const HistorialPuntajes = () => {
  const { user } = useUsers();
  const { pastTournaments, loading, paginationInfo, handleLoadMoreTournaments } = useTournaments();
  const { handleRedirect } = useScores();
  const [selectedTournament, setSelectedTournament] = useState(0);

  const redirect = async (id: number) => {
    if (selectedTournament === 0) {
      toast.error("Debe seleccionar un torneo");
      return;
    }
    const toastId = toast.loading("Abriendo la hoja de puntajes...");
    const res = await handleRedirect(id);
    if (!res?.scriptUrl) {
      toast.dismiss(toastId); // handleRedirect ya mostró el error
      return;
    }
    window.open(res.scriptUrl, "_blank");
    toast.success(
      <span>
        <b>Abriendo la hoja de puntajes...</b>
        <br />
        En caso de que la hoja no se abra, podés visualizarla en el siguiente
        enlace:
        <br />
        <a
          href={res.scriptUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontWeight: "bold", textDecoration: "underline" }}
        >
          Ver puntajes
        </a>
      </span>,
      { id: toastId, duration: 10000 }
    );
  };

  if (!pastTournaments || pastTournaments.length === 0) {
    return (
      <div className="flex justify-center items-start pt-12">
        <CardComp user={user} color="dark" textColor="white">
          <Button variant="outline-light" disabled>
            {loading ? "Cargando..." : "No hay torneos disponibles"}
          </Button>
        </CardComp>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start pt-12">
      <CardComp user={user} color="dark" textColor="white">
        <div className="flex flex-col gap-2">
          <SelectTournamentComp
            handleLoadMoreTournaments={handleLoadMoreTournaments}
            tournaments={pastTournaments}
            loading={loading}
            selectedTournament={selectedTournament}
            setSelectedTournament={setSelectedTournament}
            paginationInfo={paginationInfo}
          />
          <Button
            onClick={() => redirect(selectedTournament)}
            variant="outline-light"
            disabled={selectedTournament === 0}
            className="flex justify-center items-center gap-1"
          >
            <OneTwoThreeIcon />
            <span>Ver puntajes</span>
          </Button>
        </div>
      </CardComp>
    </div>
  );
};

export default HistorialPuntajes;
