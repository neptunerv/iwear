"use client";

import { getVisiblePageNumbers } from "@/lib/catalog-pagination";

type CatalogPaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
};

export function CatalogPagination({
  page,
  pageCount,
  onPageChange,
}: CatalogPaginationProps) {
  if (pageCount <= 1) return null;

  const pages = getVisiblePageNumbers(page, pageCount);
  const isFirst = page <= 1;
  const isLast = page >= pageCount;

  return (
    <nav
      aria-label="Catalog pages"
      className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-5"
    >
      <button
        type="button"
        disabled={isFirst}
        onClick={() => onPageChange(page - 1)}
        className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-30 sm:text-xs"
      >
        ← Back
      </button>

      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted sm:text-xs"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`Page ${item}`}
              aria-current={item === page ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={`cursor-pointer min-w-8 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors sm:min-w-9 sm:text-xs ${
                item === page
                  ? "bg-ink text-cream"
                  : "text-ink hover:text-brand"
              }`}
            >
              {item}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        disabled={isLast}
        onClick={() => onPageChange(page + 1)}
        className="cursor-pointer text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-30 sm:text-xs"
      >
        Next →
      </button>
    </nav>
  );
}
