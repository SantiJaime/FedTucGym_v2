import useUsers from "../hooks/useUsers";
import CardComp from "../components/CardComp";
import useTournaments from "../hooks/useTournaments";
import { Spinner } from "../components/ui/Spinner";
import { Tabs } from "../components/ui/Tabs";
import { useState } from "react";
import {
  MembersNotInTournamentTableComp,
  MembersTournamentsTableComp,
} from "../components/TableComp";
import useMembers from "../hooks/useMembers";
import SelectTournamentComp from "../components/SelectTournamentComp";
import FilterScoresComp from "../components/FilterScoresComp";
import type { FilterScores } from "../validation/filterScoresValidatorSchema";
import PaginationComp from "../components/PaginationComp";
import Swal from "sweetalert2";

export default function InscripcionTorneos() {
  const { user } = useUsers();
  const { handleRegisterToTournament } = useMembers();
  const {
    tournaments,
    loading,
    selectedTournament,
    setSelectedTournament,
    membersTournaments,
    membersNotInTournament,
    handleDeleteMemberFromTournament,
    handleGetMembersTournamentsByGym,
    membersTournamentsPagination,
    membersNotInTournamentsPagination,
  } = useTournaments();
  const [activeKey, setActiveKey] = useState("registrados");
  const [loadingFilter, setLoadingFilter] = useState(true);
  const [filters, setFilters] = useState<FilterScores | null>(null);
  const [actualPage, setActualPage] = useState(1);
  const [, setActualPageMNT] = useState(1);

  const condition = selectedTournament !== 0 && loadingFilter === false;

  const handleDelete = async (
    id_member: number,
    id_tournament: number,
  ) => {
    Swal.fire({
      title: "¿Está seguro de eliminar este alumno del torneo?",
      text: "En caso de arrepentimiento, luego puede volver a inscribirlo",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#15803d",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleDeleteMemberFromTournament({ id_tournament, id_member });
      }
    });
  };

  const registerToTournament = async (member: FullMemberInfo) => {
    await handleRegisterToTournament(member);
  };

  const handleFilter = async (values: FilterScores) => {
    setLoadingFilter(false);
    await handleGetMembersTournamentsByGym(values, actualPage);
  };

  const handlePageChangeMT = async (page: number) => {
    if (filters) {
      await handleGetMembersTournamentsByGym(filters, page);
    }
  };
  const handlePageChangeMNT = async (page: number) => {
    if (filters) {
      await handleGetMembersTournamentsByGym(filters, page);
    }
  };

  return (
    <>
      <div className="flex flex-col items-center pt-12">
        <CardComp user={user} color="warning" textColor="dark">
          <SelectTournamentComp
            selectedTournament={selectedTournament}
            setSelectedTournament={setSelectedTournament}
            tournaments={tournaments}
            loading={loading}
            paginationInfo={null}
            handleLoadMoreTournaments={() => Promise.resolve()}
          />
        </CardComp>
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 pb-8">
        {selectedTournament !== 0 && (
          <FilterScoresComp
            submitFilter={handleFilter}
            setFilters={setFilters}
          />
        )}
        {condition && (
          <Tabs
            tabs={["Alumnos registrados", "Alumnos para inscribir"]}
            selectedIndex={activeKey === "registrados" ? 0 : 1}
            onChange={(i) => setActiveKey(i === 0 ? "registrados" : "inscribir")}
          />
        )}
        {condition && activeKey === "registrados" ? (
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center gap-1">
                <Spinner />
                <h4 className="text-lg font-semibold text-slate-900">Cargando...</h4>
              </div>
            ) : !membersTournaments ||
              (membersTournaments.length === 0 &&
                membersTournamentsPagination &&
                membersTournamentsPagination.total === 0) ? (
              <h4 className="text-lg font-semibold text-center mt-4">
                No hay alumnos registrados en este torneo
              </h4>
            ) : membersTournaments.length === 0 &&
              membersTournamentsPagination &&
              membersTournamentsPagination.total > 0 ? (
              <PaginationComp
                pagination={membersTournamentsPagination}
                handlePageChange={handlePageChangeMT}
                setActualPage={setActualPage}
              />
            ) : (
              <>
                <MembersTournamentsTableComp
                  headers={[
                    "DNI del alumno",
                    "Nombre y apellido del alumno",
                    "Gimnasio",
                    "Acciones",
                  ]}
                  membersTournaments={membersTournaments}
                  onClickDelete={handleDelete}
                />
                {membersTournamentsPagination && (
                  <PaginationComp
                    pagination={membersTournamentsPagination}
                    handlePageChange={handlePageChangeMT}
                    setActualPage={setActualPage}
                  />
                )}
              </>
            )}
          </div>
        ) : condition && activeKey === "inscribir" ? (
          <div className="mt-4">
            {loading ? (
              <div className="flex justify-center gap-1">
                <Spinner />
                <h4 className="text-lg font-semibold text-slate-900">Cargando...</h4>
              </div>
            ) : !membersNotInTournament ||
              membersNotInTournament.length === 0 ? (
              <h4 className="text-lg font-semibold text-center mt-4">
                No hay alumnos para inscribir al torneo
              </h4>
            ) : (
              <>
                <MembersNotInTournamentTableComp
                  headers={["DNI", "Nombre", "Gimnasio", "Acciones"]}
                  members={membersNotInTournament}
                  onClickDelete={() => {}}
                  onClickRegister={registerToTournament}
                />
                {membersNotInTournamentsPagination && (
                  <PaginationComp
                    pagination={membersNotInTournamentsPagination}
                    handlePageChange={handlePageChangeMNT}
                    setActualPage={setActualPageMNT}
                  />
                )}
              </>
            )}
          </div>
        ) : (
          ""
        )}
      </div>
    </>
  );
}
