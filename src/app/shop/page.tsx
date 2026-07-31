import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { PageLoading } from "@/components/PageLoading";
import { ShopCatalogShell } from "@/components/ShopCatalogShell";
import { onlineBrandNames } from "@/lib/brands";
import {
  firstSearchParam,
  parseFiltersFromSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog-filters";
import { parseCatalogPage } from "@/lib/catalog-pagination";
import { filterOnlineBrandProducts } from "@/lib/product-utils";
import { getBestSellerHandles, getShopProducts } from "@/lib/shopify";

type ShopPageProps = {
  searchParams: Promise<CatalogSearchParams>;
};

export const metadata: Metadata = {
  title: "Shop all",
  description:
    "Shop Ray-Ban, Oakley, Swarovski and Scuderia Ferrari online at iWear Sunglasses Bali. More brands in store.",
  alternates: {
    canonical: "/shop",
  },
};

/** Refresh shop catalog data periodically (pairs with Shopify page caches). */
export const revalidate = 300;

function resolveBrandFilter(brand?: string): string | undefined {
  if (!brand) return undefined;
  // Title uses a single brand when the URL has exactly one known vendor.
  if (brand.includes(",")) return undefined;
  return onlineBrandNames.find(
    (name) => name.toLowerCase() === brand.toLowerCase(),
  );
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const query = await searchParams;
  const brand = resolveBrandFilter(firstSearchParam(query.brand));
  const initialFilters = parseFiltersFromSearchParams({
    ...query,
    ...(brand ? { brand } : {}),
  });
  const initialPage = parseCatalogPage(firstSearchParam(query.page));

  const [allProducts, bestSellerHandles] = await Promise.all([
    getShopProducts(),
    getBestSellerHandles(100),
  ]);
  const products = filterOnlineBrandProducts(allProducts);

  return (
    <Suspense fallback={<PageLoading />}>
      <ShopCatalogShell
        title={brand ?? "Shop all"}
        products={products}
        bestSellerHandles={bestSellerHandles}
        initialFilters={initialFilters}
        initialPage={initialPage}
        emptyMessage="Products coming soon — browse the layout or visit us in store."
      >
        <Footer viewport className="shop-footer" />
      </ShopCatalogShell>
    </Suspense>
  );
}
