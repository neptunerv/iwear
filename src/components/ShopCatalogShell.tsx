"use client";

import type { ReactNode } from "react";
import { ProductCatalogGrid } from "@/components/ProductCatalogGrid";
import type { CatalogFilters } from "@/lib/catalog-filters";
import type { Product } from "@/lib/shopify";

type ShopCatalogShellProps = {
  title: string;
  products: Product[];
  bestSellerHandles?: string[];
  emptyMessage?: string;
  fixedBrand?: string;
  hideSaleFilter?: boolean;
  initialFilters?: Partial<CatalogFilters>;
  initialPage?: number;
  /** Server-rendered footer (or other siblings) — keep Footer off the client graph. */
  children: ReactNode;
};

/**
 * Catalog + server children in one Suspense tree so `useSearchParams` doesn't
 * flash the viewport footer alone while search params resolve.
 */
export function ShopCatalogShell({
  children,
  ...gridProps
}: ShopCatalogShellProps) {
  return (
    <>
      <ProductCatalogGrid {...gridProps} />
      {children}
    </>
  );
}
