/**
 * Reusable Pagination component for Admin Panel.
 * Props: page (number), totalPages (number), onPageChange (fn)
 */
export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, page - delta);
      i <= Math.min(totalPages - 1, page + delta);
      i++
    ) {
      range.push(i);
    }

    rangeWithDots.push(1);

    if (range[0] > 2) rangeWithDots.push("...");
    rangeWithDots.push(...range);
    if (range[range.length - 1] < totalPages - 1) rangeWithDots.push("...");

    if (totalPages > 1) rangeWithDots.push(totalPages);

    return rangeWithDots;
  };

  return (
    <nav className="pagination" aria-label="Navigasi halaman">
      <button
        className="pagination-btn pagination-prev"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Halaman sebelumnya"
      >
        ← Prev
      </button>

      <div className="pagination-pages">
        {getPages().map((item, idx) =>
          item === "..." ? (
            <span key={`dots-${idx}`} className="pagination-dots" aria-hidden="true">
              …
            </span>
          ) : (
            <button
              key={item}
              className={`pagination-btn pagination-page${item === page ? " active" : ""}`}
              onClick={() => onPageChange(item)}
              aria-label={`Halaman ${item}`}
              aria-current={item === page ? "page" : undefined}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        className="pagination-btn pagination-next"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Halaman berikutnya"
      >
        Next →
      </button>
    </nav>
  );
}
