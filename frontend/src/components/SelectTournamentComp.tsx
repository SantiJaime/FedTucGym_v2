import { Spinner } from "./ui/Spinner";
import { Select } from "./ui/Field";

interface Props {
  selectedTournament: number;
  setSelectedTournament: React.Dispatch<React.SetStateAction<number>>;
  tournaments: Tournament[] | null;
  loading: boolean;
  paginationInfo: TournamentsPaginationInfo | null;
  handleLoadMoreTournaments: (page: number) => Promise<void>;
}

const SelectTournamentComp: React.FC<Props> = ({
  selectedTournament,
  setSelectedTournament,
  tournaments,
  loading,
  paginationInfo,
  handleLoadMoreTournaments,
}) => {
  const handleChange = async (ev: React.ChangeEvent<HTMLSelectElement>) => {
    const option = Number(ev.target.value);
    if (option === -1 && paginationInfo) {
      await handleLoadMoreTournaments(paginationInfo.page + 1);
    } else {
      setSelectedTournament(option);
    }
  };

  return (
    <>
      {loading ? (
        <div className="flex items-center justify-center gap-1">
          <Spinner className="size-4" />
          <h6 className="text-white">Cargando...</h6>
        </div>
      ) : !tournaments || tournaments.length === 0 ? (
        <p>No hay torneos disponibles</p>
      ) : (
        <form>
          <Select
            className="rounded-lg border border-slate-300 text-slate-900"
            aria-label="Torneo"
            value={selectedTournament}
            onChange={(ev) => handleChange(ev)}
          >
            <option value={0}>Seleccione un torneo</option>
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
            {paginationInfo && paginationInfo.hasMore && (
              <option value={-1}>Cargar más torneos</option>
            )}
          </Select>
        </form>
      )}
    </>
  );
};

export default SelectTournamentComp;
