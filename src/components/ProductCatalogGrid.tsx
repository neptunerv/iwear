"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatalogFilterPanel } from "@/components/CatalogFilterPanel";
import { CatalogPagination } from "@/components/CatalogPagination";
import { ProductGridTile } from "@/components/ProductGridTile";
import {
  applyCatalogFilters,
  countActiveFilters,
  createDefaultFilters,
  parseFiltersFromSearchParams,
  serializeCatalogSearchParams,
  type CatalogFilters,
  type CatalogSearchParams,
} from "@/lib/catalog-filters";
import {
  CATALOG_PAGE_SIZE,
  clampCatalogPage,
  getCatalogPageCount,
  paginateItems,
  parseCatalogPage,
} from "@/lib/catalog-pagination";
import { observeSnapHeaderTheme } from "@/lib/header-theme";
import { productInModelFamily } from "@/lib/product-model-family";
import type { Product } from "@/lib/shopify";

type ProductCatalogGridProps = {
  title: string;
  products: Product[];
  bestSellerHandles?: string[];
  emptyMessage?: string;
  fixedBrand?: string;
  hideSaleFilter?: boolean;
  initialFilters?: Partial<CatalogFilters>;
  initialPage?: number;
};

function searchParamsRecord(
  searchParams: URLSearchParams,
): CatalogSearchParams {
  return Object.fromEntries(searchParams.entries()) as CatalogSearchParams;
}

function filtersFromSearchParams(
  searchParams: URLSearchParams,
): CatalogFilters {
  return createDefaultFilters(
    parseFiltersFromSearchParams(searchParamsRecord(searchParams)),
  );
}

function catalogHref(
  pathname: string,
  filters: CatalogFilters,
  page: number,
  fixedBrand?: string,
): string {
  const query = serializeCatalogSearchParams(filters, page, { fixedBrand });
  return query ? `${pathname}?${query}` : pathname;
}

const placeholderSlots = Array.from({ length: 20 }, (_, index) => index);

function ProductGridPlaceholder() {
  return (
    <article className="flex aspect-[3/4] flex-col bg-white sm:aspect-square">
      <div aria-hidden="true" className="min-h-0 flex-1" />
      <div className="flex shrink-0 flex-col gap-0.5 px-3 py-2 sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-2 sm:px-4 sm:py-2.5">
        <span aria-hidden="true" className="h-3 w-16 bg-ink/10" />
        <div className="flex items-center justify-between gap-2 sm:contents">
          <span aria-hidden="true" className="h-3 w-10 bg-ink/10 sm:justify-self-end" />
          <div aria-hidden="true" className="flex items-center gap-1.5 sm:hidden">
            <span className="h-2 w-2 rounded-full bg-ink" />
            <span className="h-2 w-2 rounded-full border border-ink/40" />
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCatalogGrid({
  title,
  products,
  bestSellerHandles = [],
  emptyMessage = "No products yet.",
  fixedBrand,
  hideSaleFilter = false,
  initialFilters,
  initialPage = 1,
}: ProductCatalogGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();
  const writingUrl = useRef(false);

  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState(() =>
    createDefaultFilters(initialFilters),
  );

  // Cream shop catalog — black nav, white type (same as about / account).
  useEffect(() => observeSnapHeaderTheme({ forceTheme: "ink" }), []);

  // Back/forward: rehydrate filters from the URL (source of truth).
  useEffect(() => {
    if (writingUrl.current) {
      writingUrl.current = false;
      return;
    }
    setFilters(filtersFromSearchParams(searchParams));
    setPage(parseCatalogPage(searchParams.get("page") ?? undefined));
  }, [searchKey, searchParams]);

  const filteredProducts = useMemo(
    () =>
      applyCatalogFilters(
        products,
        filters,
        fixedBrand,
        bestSellerHandles,
        productInModelFamily,
      ),
    [products, filters, fixedBrand, bestSellerHandles],
  );

  const pageCount = getCatalogPageCount(
    filteredProducts.length,
    CATALOG_PAGE_SIZE,
  );
  const safePage = clampCatalogPage(page, pageCount);
  const pageProducts = paginateItems(
    filteredProducts,
    safePage,
    CATALOG_PAGE_SIZE,
  );

  useEffect(() => {
    if (page === safePage) return;
    setPage(safePage);
    writingUrl.current = true;
    router.replace(catalogHref(pathname, filters, safePage, fixedBrand), {
      scroll: false,
    });
  }, [page, safePage, filters, fixedBrand, pathname, router]);

  function commitFilters(next: CatalogFilters) {
    setFilters(next);
    setPage(1);
    writingUrl.current = true;
    router.replace(catalogHref(pathname, next, 1, fixedBrand), {
      scroll: false,
    });
  }

  function handlePageChange(nextPage: number) {
    const next = clampCatalogPage(nextPage, pageCount);
    setPage(next);
    writingUrl.current = true;
    router.push(catalogHref(pathname, filters, next, fixedBrand), {
      scroll: false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeFilterCount = countActiveFilters(filters, fixedBrand);
  const showPlaceholders = products.length === 0;
  const showEmptyState = products.length > 0 && filteredProducts.length === 0;

  return (
    <>
      <div className="bg-cream">
        <div className="grid grid-cols-[1fr_auto_1fr] border-b border-ink text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
          <div className="flex items-center px-3 py-2.5 sm:px-5">
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className="transition-colors hover:text-brand"
            >
              FILTER
              {activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
            </button>
          </div>
          <h1 className="flex items-center justify-center px-3 py-2.5 text-center sm:px-10">
            {title}
          </h1>
          <div className="flex items-center justify-end px-3 py-2.5 sm:px-5">
            <span className="shrink-0 text-ink-muted">
              {filteredProducts.length} styles
            </span>
          </div>
        </div>

        {showEmptyState ? (
          <div className="flex min-h-[min(70dvh,40rem)] flex-col items-center justify-center px-6 py-20 text-center sm:px-10">
            <p className="font-display text-4xl italic leading-none text-ink sm:text-5xl lg:text-6xl">
              No matches
            </p>
            <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
              Nothing fits these filters. Clear them or adjust your selection to
              keep browsing.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => commitFilters(createDefaultFilters())}
                className="border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
              >
                Adjust filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4">
              {showPlaceholders
                ? placeholderSlots.map((slot) => (
                    <div key={slot} className="border-b border-r border-ink">
                      <ProductGridPlaceholder />
                    </div>
                  ))
                : pageProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border-b border-r border-ink"
                    >
                      <ProductGridTile product={product} />
                    </div>
                  ))}
            </div>

            {showPlaceholders ? (
              <div className="border-t border-ink px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
                {emptyMessage}
              </div>
            ) : (
              <CatalogPagination
                page={safePage}
                pageCount={pageCount}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>

      <CatalogFilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onChange={commitFilters}
        products={products}
        fixedBrand={fixedBrand}
        hideSaleFilter={hideSaleFilter}
      />
    </>
  );
}
