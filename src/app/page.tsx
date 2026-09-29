import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";
import { Footer } from "@/components/Footer";
import { IwearWordmark } from "@/components/IwearWordmark";
import { HomeProductShowcase } from "@/components/HomeProductShowcase";
import { VisitUsSection } from "@/components/VisitUsSection";
import { featuredBrands } from "@/lib/brands";
import { homeNewHandles, homePopularHandles } from "@/lib/home-picks";
import { filterInStockProducts } from "@/lib/product-utils";
import { getProductByHandle, type Product } from "@/lib/shopify";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

async function loadPicks(handles: readonly string[]): Promise<Product[]> {
  const products = await Promise.all(
    handles.map((handle) => getProductByHandle(handle)),
  );
  return filterInStockProducts(
    products.flatMap((product) => (product ? [product] : [])),
  );
}

export default async function HomePage() {
  const [popular, newProducts] = await Promise.all([
    loadPicks(homePopularHandles),
    loadPicks(homeNewHandles),
  ]);

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
            className="flex flex-1 items-center justify-center border border-ink px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop now
          </Link>
          <Link
            href="/stores"
            className="flex flex-1 items-center justify-center border border-ink px-4 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Find a store
          </Link>
        </div>

        {/* Desktop: corner CTAs */}
        <div className="hidden items-center justify-end gap-4 px-5 pb-6 sm:flex sm:px-8">
          <Link
            href="/shop"
            className="border border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop
          </Link>
          <Link
            href="/stores"
            className="border border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Find a store
          </Link>
        </div>
      </section>

      {/* Featured brands — one viewport, equal split */}
      <section className="snap-section grid grid-rows-2 bg-ink md:grid-cols-2 md:grid-rows-1 md:border-t md:border-ink">
        {featuredBrands.map((brand, index) => (
          <Link
            key={brand.name}
            href={brand.shopHref}
            className={`group relative flex min-h-0 flex-col justify-end overflow-hidden ${
              index === 0
                ? "border-b border-ink md:border-b-0 md:border-r"
                : ""
            }`}
          >
            {brand.cardImage ? (
              <>
                <Image
                  src={brand.cardImage.src}
                  alt={brand.cardImage.alt}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  style={{
                    objectPosition: brand.cardImage.objectPosition,
                  }}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/45 to-transparent"
                />
              </>
            ) : null}

            <div className="relative z-10 px-6 py-8 text-cream sm:px-12 sm:py-16">
              <h2 className="font-poster text-5xl uppercase leading-none sm:text-7xl lg:text-8xl">
                {brand.name}
              </h2>
              <p className="mt-3 max-w-sm text-sm font-semibold leading-relaxed text-cream/80 sm:mt-4">
                {brand.blurb}
              </p>
              <p className="mt-5 inline-block border border-cream px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors group-hover:bg-cream group-hover:text-ink sm:mt-8 sm:px-8 sm:py-4 sm:text-base">
                Shop {brand.name}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <HomeProductShowcase
        strips={[
          { title: "Popular", products: popular },
          { title: "New in store", products: newProducts },
        ]}
      />

      <VisitUsSection />

      <Footer viewport snap className="home-footer" />
    </>
  );
}
