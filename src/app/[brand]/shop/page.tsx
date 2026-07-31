import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Footer } from "@/components/Footer";
import { PageLoading } from "@/components/PageLoading";
import { ShopCatalogShell } from "@/components/ShopCatalogShell";
import { getBrandPage, featuredBrands } from "@/lib/brands";
import {
  firstSearchParam,
  parseFiltersFromSearchParams,
  type CatalogSearchParams,
} from "@/lib/catalog-filters";
import { parseCatalogPage } from "@/lib/catalog-pagination";
import { formatModelLabel } from "@/lib/product-model-family";
import { getBestSellerHandles, getProductsByBrand } from "@/lib/shopify";

type BrandShopPageProps = {
  params: Promise<{ brand: string }>;
  searchParams: Promise<CatalogSearchParams>;
};

export function generateStaticParams() {
  return featuredBrands.map((brand) => ({ brand: brand.slug }));
}

/** Refresh brand shop catalog data periodically. */
export const revalidate = 300;

export async function generateMetadata({
  params,
  searchParams,
}: BrandShopPageProps): Promise<Metadata> {
  const [{ brand: slug }, query] = await Promise.all([params, searchParams]);
  const brand = getBrandPage(slug);

  if (!brand) {
    return { title: "Shop not found" };
  }

  const family = firstSearchParam(query.family);
  if (family) {
    const modelName = formatModelLabel(family);
    return {
      title: `${modelName} · ${brand.name}`,
      description: `Browse all ${modelName} colors from ${brand.name} at iWear Sunglasses Bali.`,
    };
  }

  return {
    title: `Shop ${brand.name}`,
    description: `Browse ${brand.name} sunglasses at iWear Sunglasses Bali.`,
  };
}

export default async function BrandShopPage({
  params,
  searchParams,
}: BrandShopPageProps) {
  const [{ brand: slug }, query] = await Promise.all([params, searchParams]);
  const brand = getBrandPage(slug);

  if (!brand) {
    notFound();
  }

  const [products, bestSellerHandles] = await Promise.all([
    getProductsByBrand(brand.name),
    getBestSellerHandles(100),
  ]);
  const family = firstSearchParam(query.family);
  const initialFilters = parseFiltersFromSearchParams(query);
  const initialPage = parseCatalogPage(firstSearchParam(query.page));
  const title = family ? formatModelLabel(family) : brand.name;

  return (
    <Suspense fallback={<PageLoading />}>
      <ShopCatalogShell
        title={title}
        products={products}
        bestSellerHandles={bestSellerHandles}
        fixedBrand={brand.name}
        initialFilters={initialFilters}
        initialPage={initialPage}
        emptyMessage={
          family
            ? `No ${formatModelLabel(family)} styles found.`
            : `No ${brand.name} products yet — check back soon.`
        }
      >
        <Footer viewport className="shop-footer" />
      </ShopCatalogShell>
    </Suspense>
  );
}
