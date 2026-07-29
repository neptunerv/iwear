import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${site.name} — eyewear in Bali.`,
};

export default function AboutPage() {
  return (
    <>
      <HomeScrollSnap keepHeaderBorder />

      <section
        id="hero"
        className="snap-section relative flex flex-col overflow-y-auto bg-cream text-ink"
      >
        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            Our story
          </p>
          <h1 className="mt-3 font-display text-5xl italic leading-none text-ink sm:text-6xl">
            Eyewear in Bali
          </h1>

          <div className="mt-6 max-w-lg space-y-4 text-sm font-semibold leading-relaxed text-ink-muted sm:text-base">
            <p>
              {site.name} is a Bali-based shop for premium sunglasses. We stock
              Ray-Ban, Oakley, Swarovski, Scuderia Ferrari, and dozens of other
              brands — online and in our Beachwalk Kuta and Icon Mall Sanur
              stores.
            </p>
            <p>
              Island light is sharp and the days run long. Whether you need
              polarized lenses for the water or a classic frame for everyday
              wear, our team helps you find the right fit in person or ship your
              pair across Bali and beyond.
            </p>
            <p>
              Shop Ray-Ban and Oakley online anytime. Visit us in store to try on
              frames, get fitted, and explore luxury brands available only on the
              floor.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/shop"
              className="border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
            >
              Shop online
            </Link>
            <Link
              href="/stores"
              className="border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
            >
              Find a store
            </Link>
          </div>
        </div>
      </section>

      <Footer viewport snap className="about-page" />
    </>
  );
}
