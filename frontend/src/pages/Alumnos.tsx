import { Spinner } from "../components/ui/Spinner";
import useUsers from "../hooks/useUsers";
import useMembers from "../hooks/useMembers";
import CardComp from "../components/CardComp";
import { MembersTableComp } from "../components/TableComp";
import CreateMemberComp from "../components/CreateMemberComp";
import Swal from "sweetalert2";
import FilterComp from "../components/FilterComp";
import type { FilterMembers } from "../validation/filterMembersValidatorSchema";
import PaginationComp from "../components/PaginationComp";
import { useState } from "react";
import useGyms from "../hooks/useGyms";
import { toast } from "sonner";

export default function Alumnos() {
  const { user } = useUsers();
  const { gyms } = useGyms();
  const {
    members,
    handleDeleteMember,
    handleGetMembers,
    loading,
    membersPagination,
  } = useMembers();
  const [filters, setFilters] = useState<FilterMembers | null>(null);
  const [actualPage, setActualPage] = useState(1);
  const [loadingFilter, setLoadingFilter] = useState(true);
  const [editingMember, setEditingMember] = useState<FullMemberInfo | null>(null);

  const onClickDelete = (id: number) => {
    Swal.fire({
      title: "¿Está seguro de eliminar este alumno?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#15803d",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Si, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await handleDeleteMember(id);
      }
    });
  };

  const submitFilter = async (paramFilters: FilterMembers) => {
    if (user && user.role === "Administrador" && paramFilters.id_gym === 0) {
      toast.error("Debe seleccionar un gimnasio");
      return;
    }
    await handleGetMembers(paramFilters, actualPage);
  };

  const handlePageChange = async (page: number) => {
    if (filters) await handleGetMembers(filters, page);
  };

  return (
    <div className="mx-auto mt-12 w-full max-w-7xl px-4 pb-8">
      <div className="flex justify-center">
        <CardComp user={user} color="danger" textColor="white" />
      </div>
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">Tabla de alumnos</h3>
        {user && user.role === "Gimnasio" && <CreateMemberComp />}
      </div>
      <hr className="my-4 border-slate-300" />
      <h4 className="text-lg font-semibold">Filtrar por:</h4>
      <FilterComp
        submitFilter={submitFilter}
        setFilters={setFilters}
        setLoadingFilter={setLoadingFilter}
        gyms={gyms}
        user={user}
        color="danger"
        textColor="white"
      />
      <hr className="my-4 border-slate-300" />
      {!loadingFilter ? (
        <>
          {loading ? (
            <div className="flex flex-col items-center justify-center">
              <Spinner />
              <h4 className="text-lg font-semibold">Obteniendo alumnos...</h4>
            </div>
          ) : !members ||
            (members.length === 0 &&
              membersPagination &&
              membersPagination.total === 0) ? (
            <h4 className="text-lg font-semibold text-center">No se encontraron alumnos</h4>
          ) : members.length === 0 &&
            membersPagination &&
            membersPagination.total > 0 ? (
            <PaginationComp
              pagination={membersPagination}
              setActualPage={setActualPage}
              handlePageChange={handlePageChange}
            />
          ) : (
            <>
              <MembersTableComp
                members={members}
                headers={[
                  "DNI",
                  "Nombre y apellido",
                  "Fecha de nacimiento",
                  "Gimnasio",
                  "Categoría",
                  "Nivel",
                  "Acciones",
                ]}
                onClickDelete={onClickDelete}
                onClickEdit={setEditingMember}
                onClickRegister={() => {}}
              />
              {membersPagination && (
                <PaginationComp
                  pagination={membersPagination}
                  setActualPage={setActualPage}
                  handlePageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      ) : (
        ""
      )}
      {editingMember && (
        <CreateMemberComp
          key={editingMember.id}
          member={editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
