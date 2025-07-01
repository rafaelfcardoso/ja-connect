import React from "react";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ page, pageSize, total, onPageChange, pageSizeOptions = [5, 10, 20, 50], onPageSizeChange }) => {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1 && (!onPageSizeChange || pageSizeOptions.length <= 1)) return null;

  const handlePrev = () => {
    if (page > 1) onPageChange(page - 1);
  };
  const handleNext = () => {
    if (page < totalPages) onPageChange(page + 1);
  };
  return (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-6 mb-2 px-4">
      {onPageSizeChange && (
        <div className="flex items-center gap-2">
          <span className="text-sm">Itens por página:</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          className="px-4 py-1 rounded border bg-white disabled:opacity-50 mx-1"
          onClick={handlePrev}
          disabled={page === 1}
        >
          Anterior
        </button>
        <span className="mx-3 text-sm font-medium">
          Página {page} de {totalPages}
        </span>
        <button
          className="px-4 py-1 rounded border bg-white disabled:opacity-50 mx-1"
          onClick={handleNext}
          disabled={page === totalPages}
        >
          Próxima
        </button>
      </div>
    </div>
  );
};
