import type { Dispatch, SetStateAction } from "react";
import { ArrowLeftCircle, ArrowRightCircle } from "lucide-react";
import { Button } from "./ui/Button";

interface Props {
  pagination: Pagination;
  setActualPage: Dispatch<SetStateAction<number>>;
  handlePageChange: (page: number) => void;
}

const PaginationComp: React.FC<Props> = ({ pagination, setActualPage, handlePageChange }) => {
  const { page, totalPages } = pagination;
  const goToNextPage = () => {
    if (page < totalPages) {
      setActualPage((prevPage) => prevPage + 1);
      handlePageChange(page + 1);
    }
  };

  const goToPreviousPage = () => {
    if (page > 1) {
      setActualPage((prevPage) => prevPage - 1);
      handlePageChange(page - 1);
    }
  };
  return (
    <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
      <Button
        onClick={goToPreviousPage}
        disabled={pagination.page === 1}
        variant="dark"
      >
        <ArrowLeftCircle size={18} />
        <span>Anterior</span>
      </Button>
      <span>
        Página <strong>{pagination.page}</strong> de{" "}
        <strong>{pagination.totalPages}</strong>
      </span>
      <Button
        onClick={goToNextPage}
        disabled={pagination.page === pagination.totalPages}
        variant="dark"
      >
        <span>Siguiente</span>
        <ArrowRightCircle size={18} />
      </Button>
    </div>
  );
};

export default PaginationComp;
