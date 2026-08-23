"use client";

export function Pager({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="pager">
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span className="mono pager-meta">
        {page} / {pageCount}
      </span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
