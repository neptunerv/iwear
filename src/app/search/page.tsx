import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { ProductCatalogGrid } from "@/components/ProductCatalogGrid";
import { SearchPageBar } from "@/components/SearchPageBar";
import { parseCatalogPage } from "@/lib/catalog-pagination";
import { filterOnlineBrandProducts } from "@/lib/product-utils";
import { getBestSellerHandles, searchProducts } from "@/lib/shopify";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Search",
  description: `Search the ${site.name} collection.`,
  alternates: {
    canonical: "/search",
  },
};

type SearchPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q = "", page } = await searchParams;
  const query = q.trim();
  const initialPage = parseCatalogPage(page);

  const [rawProducts, bestSellerHandles] = await Promise.all([
    query ? searchProducts(query, 100) : Promise.resolve([]),
    getBestSellerHandles(100),
  ]);
  const products = filterOnlineBrandProducts(rawProducts);

  return (
    <>
      <SearchPageBar defaultQuery={query} />

      {query && products.length === 0 ? (
        <div className="flex min-h-[min(70dvh,40rem)] flex-col items-center justify-center bg-cream px-6 py-20 text-center sm:px-10">
          <p className="font-display text-4xl italic leading-none text-ink sm:text-5xl lg:text-6xl">
            No matches
          </p>
          <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
            Nothing matched &ldquo;{query}&rdquo;. Try another search or browse
            the full shop.
          </p>
          <Link
            href="/shop"
            className="mt-8 border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop all
          </Link>
        </div>
      ) : query ? (
        <ProductCatalogGrid
          title={query}
          products={products}
          bestSellerHandles={bestSellerHandles}
          initialPage={initialPage}
          emptyMessage="No results for this search."
        />
      ) : (
        <div className="flex min-h-[min(70dvh,40rem)] flex-col items-center justify-center bg-cream px-6 py-20 text-center sm:px-10">
          <p className="font-display text-4xl italic leading-none text-ink sm:text-5xl lg:text-6xl">
            Find frames
          </p>
          <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
            Search by brand, model, or style — or browse the full collection.
          </p>
          <Link
            href="/shop"
            className="mt-8 border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop all
          </Link>
        </div>
      )}

      <Footer viewport className="shop-footer" />
    </>
  );
}
