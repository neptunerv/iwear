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

      {/* Poster hero — mobile: top chrome / centered mark / inset CTA */}
      <section id="hero" className="snap-section relative flex flex-col bg-brand text-ink">
        <div className="flex flex-1 items-center justify-center px-8 py-10 sm:px-12 sm:py-12">
          <h1>
            <IwearWordmark className="mx-auto w-[min(72vw,48rem)] text-ink" />
            <span className="sr-only">iWear Sunglasses</span>
          </h1>
        </div>

        {/* Mobile: inset rectangle CTAs */}
        <div className="flex gap-3 px-5 pb-8 sm:hidden">
          <Link
            href="/shop"
            className="flex flex-1 items-center justify-center border-2 border-ink px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop now
          </Link>
          <Link
            href="/stores"
            className="flex flex-1 items-center justify-center border-2 border-ink px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Find a store
          </Link>
        </div>

        {/* Desktop: corner CTAs */}
        <div className="hidden items-center justify-end gap-4 px-5 pb-6 sm:flex sm:px-8">
          <Link
            href="/shop"
            className="border-2 border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
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

      {/* Featured brands — one viewport, equal split */}
      <section className="snap-section grid grid-rows-2 bg-cream md:grid-cols-2 md:grid-rows-1 md:border-t-2 md:border-ink">
        {featuredBrands.map((brand, index) => (
          <Link
            key={brand.name}
            href={brand.shopHref}
            className={`group flex min-h-0 flex-col justify-end bg-cream px-6 py-8 transition-colors hover:bg-sand-50 sm:px-12 sm:py-16 ${
              index === 0
                ? "border-b-2 border-ink md:border-b-0 md:border-r-2"
                : ""
            }`}
          >
            <div className="min-h-0">
              <h2 className="font-poster text-5xl uppercase leading-none sm:text-7xl lg:text-8xl">
                {brand.name}
              </h2>
              <p className="mt-3 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted sm:mt-4">
                {brand.blurb}
              </p>
              <p className="mt-5 inline-block border-2 border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors group-hover:bg-ink group-hover:text-cream sm:mt-8 sm:px-8 sm:py-4 sm:text-base">
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
