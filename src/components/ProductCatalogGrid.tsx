"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CatalogFilterPanel } from "@/components/CatalogFilterPanel";
import { CatalogPagination } from "@/components/CatalogPagination";
import { ProductGridTile } from "@/components/ProductGridTile";
import {
  applyCatalogFilters,
  countActiveFilters,
  createDefaultFilters,
  type CatalogFilters,
} from "@/lib/catalog-filters";
import {
  CATALOG_PAGE_SIZE,
  clampCatalogPage,
  getCatalogPageCount,
  paginateItems,
} from "@/lib/catalog-pagination";
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

function catalogHref(pathname: string, page: number): string {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

const placeholderSlots = Array.from({ length: 20 }, (_, index) => index);

function ProductGridPlaceholder() {
  return (
    <article className="flex aspect-square flex-col bg-white">
      <div aria-hidden="true" className="min-h-0 flex-1" />
      <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:px-4">
        <span aria-hidden="true" className="h-3 w-16 bg-ink/10" />
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink" />
          <span className="h-2 w-2 rounded-full border border-ink/40" />
          <span className="h-2 w-2 rounded-full border border-ink/40" />
        </div>
        <span aria-hidden="true" className="justify-self-end h-3 w-5 bg-ink/10" />
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
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  routerRef.current = router;
  pathnameRef.current = pathname;

  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [filters, setFilters] = useState(() =>
    createDefaultFilters(initialFilters),
  );
  const skipFilterPageReset = useRef(true);

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
    setPage(initialPage);
  }, [initialPage]);

  useEffect(() => {
    if (skipFilterPageReset.current) {
      skipFilterPageReset.current = false;
      return;
    }
    setPage(1);
    routerRef.current.replace(catalogHref(pathnameRef.current, 1), {
      scroll: false,
    });
  }, [filters, fixedBrand]);

  useEffect(() => {
    if (page === safePage) return;
    setPage(safePage);
    routerRef.current.replace(catalogHref(pathnameRef.current, safePage), {
      scroll: false,
    });
  }, [page, safePage]);

  function handlePageChange(nextPage: number) {
    const next = clampCatalogPage(nextPage, pageCount);
    setPage(next);
    router.push(catalogHref(pathname, next), { scroll: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeFilterCount = countActiveFilters(filters, fixedBrand);
  const showPlaceholders = products.length === 0;
  const showEmptyState = products.length > 0 && filteredProducts.length === 0;

  return (
    <>
      <div className="bg-cream">
        <div className="grid grid-cols-[1fr_auto_1fr] border-b-2 border-ink text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs">
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
                onClick={() => setFilters(createDefaultFilters())}
                className="border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => setFilterOpen(true)}
                className="border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
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
                    <div key={slot} className="border-b-2 border-r-2 border-ink">
                      <ProductGridPlaceholder />
                    </div>
                  ))
                : pageProducts.map((product) => (
                    <div
                      key={product.id}
                      className="border-b-2 border-r-2 border-ink"
                    >
                      <ProductGridTile product={product} />
                    </div>
                  ))}
            </div>

            {showPlaceholders ? (
              <div className="border-t-2 border-ink px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">
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
        onChange={setFilters}
        products={products}
        fixedBrand={fixedBrand}
        hideSaleFilter={hideSaleFilter}
      />
    </>
  );
}
