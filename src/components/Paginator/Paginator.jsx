import Button from "../Button/Button";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
} from "@remixicon/react";
import "./Paginator.css";

export default function Paginator({ page, total, perPage, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  if (totalPages <= 1) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handlePageClick = (p) => {
    if (p === page) return;
    onPageChange(p);
  };

  return (
    <div className="data-paginator">
      <Button
        variant="outline"
        size="sm"
        disabled={!canPrev}
        onClick={() => canPrev && onPageChange(page - 1)}
      >
        <RiArrowLeftSLine size={16} />
        Anterior
      </Button>

      <div className="data-paginator__pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <Button
            key={p}
            type="button"
            className={`data-paginator__page ${
              p === page ? "data-paginator__page--active" : ""
            }`}
            onClick={() => handlePageClick(p)}
          >
            {p}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        size="sm"
        disabled={!canNext}
        onClick={() => canNext && onPageChange(page + 1)}
      >
        Siguiente
        <RiArrowRightSLine size={16} />
      </Button>
    </div>
  );
}