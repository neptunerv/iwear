import type { Metadata } from "next";
import Link from "next/link";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `The story behind ${site.name} — authorized eyewear reseller in Bali.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-widest text-ink-muted">
        Our story
      </p>
      <h1 className="mt-3 font-display text-4xl text-ink md:text-5xl">
        Authorized eyewear in Bali
      </h1>

      <div className="mt-10 space-y-6 text-lg font-semibold leading-relaxed text-ink-muted">
        <p>
          {site.name} is a Bali-based authorized reseller of premium sunglasses.
          We stock authentic Ray-Ban, Oakley, Swarovski, Scuderia Ferrari, and
          dozens of other brands — online and in our Beachwalk Kuta and Icon Mall
          Sanur stores.
        </p>
        <p>
          Island light is sharp and the days run long. Whether you need polarized
          lenses for the water or a classic frame for everyday wear, our team
          helps you find the right fit in person or ship your pair across Bali and
          beyond.
        </p>
        <p>
          Shop Ray-Ban and Oakley online anytime. Visit us in store to try on
          frames, get fitted, and explore luxury brands available only on the
          floor.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
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
  );
}
