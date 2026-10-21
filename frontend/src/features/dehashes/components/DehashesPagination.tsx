type DehashesPaginationProps = {
  page: number;
  totalPages: number;
  /** Cuántos dehashes hay con el filtro que esté puesto. */
  total: number;
  /** Mientras se recarga, los botones se apagan para no pedir dos veces. */
  isRefreshing: boolean;
  onPageChange: (page: number) => void;
};

/** Anterior / Siguiente con la página en la que se está. No se muestra si hay una sola. */
export function DehashesPagination({
  page,
  totalPages,
  total,
  isRefreshing,
  onPageChange,
}: DehashesPaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      className="dehashes-pagination"
      aria-label="Páginas del historial de dehashes"
    >
      <button
        className="dehashes-page-button"
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isRefreshing}
      >
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M9.8 3.6 5.4 8l4.4 4.4" />
        </svg>
        Anterior
      </button>

      <span className="dehashes-page-status">
        <strong>
          Página {page} de {totalPages}
        </strong>
        <span className="dehashes-page-total">
          {total} {total === 1 ? "intento" : "intentos"}
        </span>
      </span>

      <button
        className="dehashes-page-button"
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages || isRefreshing}
      >
        Siguiente
        <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6.2 3.6 10.6 8l-4.4 4.4" />
        </svg>
      </button>
    </nav>
  );
}
