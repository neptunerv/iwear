import Link from "next/link";
import { ProductGridTile } from "@/components/ProductGridTile";
import type { Product } from "@/lib/shopify";

type ProductRelatedRailProps = {
  title: string;
  products: Product[];
  viewAllHref?: string | null;
  /** Last rail: no section bottom border (footer supplies the line). */
  isLast?: boolean;
};

export function ProductRelatedRail({
  title,
  products,
  viewAllHref = null,
  isLast = false,
}: ProductRelatedRailProps) {
  if (products.length === 0) return null;

  const lastRowDesktop = Math.floor((products.length - 1) / 4);
  const lastRowMobile = Math.floor((products.length - 1) / 2);

  return (
    <section className={`bg-cream${isLast ? "" : " border-b border-ink"}`}>
      <div className="flex items-center justify-between gap-3 border-b border-ink px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] sm:px-5 sm:text-xs">
        <h2>{title}</h2>
        {viewAllHref ? (
          <Link
            href={viewAllHref}
            className="shrink-0 tracking-[0.18em] transition-colors hover:text-brand sm:tracking-[0.2em]"
          >
            View all →
          </Link>
        ) : null}
      </div>

      {/*
        Borders (not gap+[bg-ink]): incomplete rows leave empty grid tracks, and
        an ink grid background paints those tracks solid black.
      */}
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {products.map((product, index) => {
          const isLastCol = (index + 1) % 4 === 0;
          const isLastColMobile = index % 2 === 1;
          const isLastRowDesktop = Math.floor(index / 4) === lastRowDesktop;
          const isLastRowMobile = Math.floor(index / 2) === lastRowMobile;
          const omitBottomDesktop = isLastRowDesktop;
          const omitBottomMobile = isLastRowMobile;

          return (
            <div
              key={product.id}
              className={[
                "border-ink",
                isLastCol ? "sm:border-r-0" : "sm:border-r",
                isLastColMobile ? "max-sm:border-r-0" : "max-sm:border-r",
                omitBottomDesktop ? "sm:border-b-0" : "sm:border-b",
                omitBottomMobile ? "max-sm:border-b-0" : "max-sm:border-b",
              ].join(" ")}
            >
              <ProductGridTile product={product} />
            </div>
          );
        })}
      </div>
    </section>
  );
}
