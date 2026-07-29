import Link from "next/link";
import { ProductGridTile } from "@/components/ProductGridTile";
import type { Product } from "@/lib/shopify";

type Strip = {
  title: string;
  products: Product[];
};

type HomeProductShowcaseProps = {
  strips: Strip[];
  slotCount?: number;
};

function ProductGridPlaceholder({ fill = false }: { fill?: boolean }) {
  return (
    <article
      className={`flex flex-col bg-white ${
        fill ? "h-full min-h-0" : "aspect-square"
      }`}
    >
      <div aria-hidden="true" className="min-h-0 flex-1" />
    </article>
  );
}

function stripCellBorderClass(index: number) {
  const isLastColMobile = index % 2 === 1;
  const isLastColDesktop = (index + 1) % 4 === 0;

  return [
    "border-b-2 border-r-2 border-ink",
    isLastColMobile && "max-md:border-r-0",
    isLastColDesktop && "md:border-r-0",
  ]
    .filter(Boolean)
    .join(" ");
}

function StripHeader({
  title,
  borderedTop = false,
}: {
  title: string;
  borderedTop?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-between border-b-2 border-ink px-5 py-2 sm:px-8 sm:py-2.5 ${
        borderedTop ? "border-t-2" : ""
      }`}
    >
      <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-ink sm:text-sm">
        {title}
      </h2>
      <Link
        href="/shop"
        className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:text-brand sm:text-xs sm:tracking-[0.2em]"
      >
        View all →
      </Link>
    </div>
  );
}

function StripGrid({
  strip,
  slotCount,
  fill,
}: {
  strip: Strip;
  slotCount: number;
  fill: boolean;
}) {
  const slots = Array.from(
    { length: slotCount },
    (_, slotIndex) => strip.products[slotIndex],
  );

  return (
    <div
      className={
        fill
          ? "grid min-h-0 flex-1 grid-cols-2 grid-rows-2 md:grid-cols-4 md:grid-rows-1"
          : "grid grid-cols-2 md:min-h-0 md:flex-1 md:grid-cols-4 md:grid-rows-1"
      }
    >
      {slots.map((product, slotIndex) => (
        <div
          key={product?.id ?? `${strip.title}-slot-${slotIndex}`}
          className={
            fill
              ? `h-full min-h-0 overflow-hidden ${stripCellBorderClass(slotIndex)}`
              : `aspect-square overflow-hidden md:aspect-auto md:h-full md:min-h-0 ${stripCellBorderClass(slotIndex)}`
          }
        >
          {product ? (
            <ProductGridTile product={product} fill />
          ) : (
            <ProductGridPlaceholder fill />
          )}
        </div>
      ))}
    </div>
  );
}

export function HomeProductShowcase({
  strips,
  slotCount = 4,
}: HomeProductShowcaseProps) {
  return (
    <>
      {/* Mobile — one snap page per strip */}
      {strips.map((strip) => (
        <section
          key={`mobile-${strip.title}`}
          className="snap-section flex flex-col overflow-hidden border-x-2 border-ink bg-cream md:hidden"
        >
          <StripHeader title={strip.title} />
          <StripGrid strip={strip} slotCount={slotCount} fill />
        </section>
      ))}

      {/* Desktop — both strips share one snap page */}
      <section className="hidden snap-section flex-col overflow-hidden border-x-2 border-ink bg-cream md:flex">
        {strips.map((strip, index) => (
          <div
            key={`desktop-${strip.title}`}
            className="flex min-h-0 flex-1 flex-col"
          >
            <StripHeader title={strip.title} borderedTop={index === 0} />
            <StripGrid strip={strip} slotCount={slotCount} fill />
          </div>
        ))}
      </section>
    </>
  );
}
