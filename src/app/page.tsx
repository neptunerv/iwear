import Link from "next/link";
import type { Metadata } from "next";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";
import { Footer } from "@/components/Footer";
import { IwearWordmark } from "@/components/IwearWordmark";
import { HomeProductShowcase } from "@/components/HomeProductShowcase";
import { TrustSection } from "@/components/TrustSection";
import { VisitUsSection } from "@/components/VisitUsSection";
import { featuredBrands } from "@/lib/brands";
import { filterOnlineBrandProducts } from "@/lib/product-utils";
import { getBestSellers, getNewProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const [bestSellersRaw, newProductsRaw] = await Promise.all([
    getBestSellers(12),
    getNewProducts(12),
  ]);
  const bestSellers = filterOnlineBrandProducts(bestSellersRaw).slice(0, 4);
  const newProducts = filterOnlineBrandProducts(newProductsRaw).slice(0, 4);

  return (
    <>
      <HomeScrollSnap />

      {/* Poster hero — Ray-Ban House style, black on brand red */}
      <section id="hero" className="snap-section relative flex flex-col bg-brand text-ink">
        <div className="flex flex-1 items-center justify-center px-8 py-12 sm:px-12">
          <h1>
            <IwearWordmark className="mx-auto w-[min(78vw,48rem)] text-ink" />
            <span className="sr-only">iWear Sunglasses</span>
          </h1>
        </div>

        <div className="flex items-center justify-end gap-4 px-5 pb-6 sm:px-8">
          <Link
            href="/shop"
            className="hidden border-2 border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand sm:inline-block"
          >
            Shop
          </Link>
          <Link
            href="/stores"
            className="border-2 border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Find a store
          </Link>
        </div>
      </section>

      {/* Featured brands — full viewport split */}
      <section className="snap-section grid border-t-2 border-ink bg-cream md:grid-cols-2">
        {featuredBrands.map((brand, index) => (
          <Link
            key={brand.name}
            href={brand.shopHref}
            className={`group flex min-h-[50vh] flex-col justify-end bg-cream px-8 py-12 transition-colors hover:bg-sand-50 sm:px-12 sm:py-16 md:min-h-0 ${
              index === 0
                ? "border-b-2 border-ink md:border-b-0 md:border-r-2"
                : ""
            }`}
          >
            <div>
              <h2 className="font-poster text-6xl uppercase leading-none sm:text-7xl lg:text-8xl">
                {brand.name}
              </h2>
              <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
                {brand.blurb}
              </p>
              <p className="mt-8 inline-block border-2 border-ink px-6 py-3.5 text-sm font-bold uppercase tracking-[0.2em] transition-colors group-hover:bg-ink group-hover:text-cream sm:px-8 sm:py-4 sm:text-base">
                Shop {brand.name}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <HomeProductShowcase
        strips={[
          { title: "Best sellers", products: bestSellers },
          { title: "New in store", products: newProducts },
        ]}
      />

      <TrustSection />

      <VisitUsSection />

      <Footer viewport snap className="home-footer" />
    </>
  );
}
