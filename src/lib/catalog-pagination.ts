export const CATALOG_PAGE_SIZE = 60;

export function getCatalogPageCount(totalItems: number, pageSize = CATALOG_PAGE_SIZE) {
  if (totalItems <= 0) return 1;
  return Math.ceil(totalItems / pageSize);
}

export function parseCatalogPage(value: string | null | undefined): number {
  if (!value) return 1;
  const page = Number.parseInt(value, 10);
  if (!Number.isFinite(page) || page < 1) return 1;
  return page;
}

export function clampCatalogPage(page: number, pageCount: number) {
  if (!Number.isFinite(page) || page < 1) return 1;
  return Math.min(page, Math.max(1, pageCount));
}

export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize = CATALOG_PAGE_SIZE,
): T[] {
  const pageCount = getCatalogPageCount(items.length, pageSize);
  const safePage = clampCatalogPage(page, pageCount);
  const start = (safePage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/** Compact page list with ellipses for long catalogs, e.g. [1, 2, 3, '…', 9]. */
export function getVisiblePageNumbers(
  currentPage: number,
  pageCount: number,
): Array<number | "ellipsis"> {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, pageCount, currentPage]);
  for (let offset = 1; offset <= 1; offset++) {
    pages.add(currentPage - offset);
    pages.add(currentPage + offset);
  }

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= pageCount)
    .sort((a, b) => a - b);

  const result: Array<number | "ellipsis"> = [];
  for (const page of sorted) {
    const prev = result[result.length - 1];
    if (typeof prev === "number" && page - prev > 1) {
      result.push("ellipsis");
    }
    result.push(page);
  }

  return result;
}
