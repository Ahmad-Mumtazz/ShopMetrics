export default function Pagination({ page, pageCount, totalItems, pageSize, onPageChange }) {
  if (pageCount <= 1) return null;
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);

  return (
    <nav className="pagination" aria-label="Pagination">
      <span className="pagination__summary">Showing {start}-{end} of {totalItems}</span>
      <div className="pagination__controls">
        <button type="button" disabled={page === 1} onClick={() => onPageChange(page - 1)}>Previous</button>
        <span className="pagination__count">Page {page} of {pageCount}</span>
        <button type="button" disabled={page === pageCount} onClick={() => onPageChange(page + 1)}>Next</button>
      </div>
    </nav>
  );
}
