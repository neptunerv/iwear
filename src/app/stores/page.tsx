import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";
import { VisitUsSection } from "@/components/VisitUsSection";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stores",
  description:
    "Visit iWear Sunglasses at Beachwalk Kuta or Icon Mall Sanur. Try on frames in person — Michael Kors, Prada, Gucci, Dior and more brands only in store.",
};

export default function StoresPage() {
  return (
    <>
      <HomeScrollSnap />

      <section
        id="hero"
        className="snap-section relative flex flex-col bg-brand text-ink"
      >
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-12 text-center sm:px-12">
          <h1 className="font-display text-5xl italic leading-none sm:text-7xl lg:text-8xl">
            Our Bali stores
          </h1>
          <p className="mt-6 max-w-md text-sm font-semibold leading-relaxed text-ink/80 sm:text-base">
            Visit us to try on frames, get fitted, and walk out wearing your
            pair.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <a
              href={site.messageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
            >
              {site.whatsappLabel}
            </a>
            <Link
              href="/shop"
              className="border border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
            >
              Shop online
            </Link>
          </div>
        </div>
      </section>

      <VisitUsSection />

      <div className="snap-section snap-section-scroll flex flex-col border-t border-ink bg-cream text-ink">
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 sm:py-16">
          <h2 className="font-display text-center text-5xl italic leading-none sm:text-6xl lg:text-7xl">
            Exclusive in store
          </h2>
          <p className="mt-5 max-w-md text-center text-sm font-semibold leading-relaxed text-ink/80 sm:text-base">
            Prada, Gucci, Dior and more — try them at Beachwalk or Sanur.
          </p>

          <ul className="mt-8 flex w-full max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-4 sm:mt-12 sm:gap-x-10 sm:gap-y-10">
            {site.inStoreBrandLogos.map((brand) => (
              <li
                key={brand.name}
                className="flex h-9 w-[calc(50%-0.5rem)] items-center justify-center px-3 sm:h-16 sm:w-[calc(33.333%-1.67rem)] sm:px-2 lg:w-[calc(25%-1.875rem)]"
              >
                <Image
                  src={brand.src}
                  alt={brand.name}
                  width={240}
                  height={64}
                  unoptimized
                  className={
                    brand.name === "Oliver Peoples"
                      ? "max-h-7 w-auto max-w-full object-contain object-center sm:max-h-14"
                      : "max-h-6 w-auto max-w-full object-contain object-center sm:max-h-12"
                  }
                />
              </li>
            ))}
          </ul>

          <Link
            href="/shop"
            className="mt-10 text-sm font-bold uppercase tracking-[0.2em] underline underline-offset-4 sm:mt-12"
          >
            Shop online brands →
          </Link>
        </div>
      </div>

      <Footer viewport snap className="home-footer" />
    </>
  );
}
