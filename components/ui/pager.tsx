"use client";

import { buttons, mono } from "@/lib/ui";
import { cn } from "@/lib/utils";

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
    <div className="mt-4 flex items-center justify-end gap-2.5">
      <button
        type="button"
        className={buttons("ghost", "sm")}
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
      >
        Previous
      </button>
      <span className={cn(mono, "text-[0.72rem] text-ink-50")}>
        {page} / {pageCount}
      </span>
      <button
        type="button"
        className={buttons("ghost", "sm")}
        disabled={page >= pageCount}
        onClick={() => onPage(page + 1)}
      >
        Next
      </button>
    </div>
  );
}
