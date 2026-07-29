import Link from "next/link";
import { ProductStripPlaceholder } from "@/components/ProductStripPlaceholder";
import { ProductStripTile } from "@/components/ProductStripTile";
import type { Product } from "@/lib/shopify";

type ProductSectionProps = {
  title: string;
  products: Product[];
  className?: string;
  embedded?: boolean;
  slotCount?: number;
};

function stripCellBorderClass(index: number) {
  const isLastColMobile = index % 2 === 1;
  const isLastColDesktop = (index + 1) % 4 === 0;

  return [
    "border-b border-r border-ink",
    isLastColMobile && "max-md:border-r-0",
    isLastColDesktop && "md:border-r-0",
  ]
    .filter(Boolean)
    .join(" ");
}

export function ProductSection({
  title,
  products,
  className = "bg-cream",
  embedded = false,
  slotCount = 4,
}: ProductSectionProps) {
  const Tag = embedded ? "div" : "section";
  const slots = Array.from({ length: slotCount }, (_, index) => products[index]);

  return (
    <Tag
      className={
        embedded
          ? className
          : `flex flex-col justify-center ${className}`
      }
    >
      <div
        className={
          embedded
            ? "border-x border-ink"
            : "mx-auto w-full max-w-7xl border-x border-ink py-20"
        }
      >
        <div className="flex items-center justify-between border-b border-t border-ink px-5 py-3 sm:px-8 sm:py-3.5">
          <h2
            className={`uppercase tracking-[0.12em] text-ink ${
              embedded
                ? "text-xs font-bold sm:text-sm"
                : "font-poster text-2xl sm:text-3xl"
            }`}
          >
            {title}
          </h2>
          <Link
            href="/shop"
            className="text-[10px] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:text-brand sm:text-xs sm:tracking-[0.2em]"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4">
          {slots.map((product, index) => (
            <div
              key={product?.id ?? `${title}-slot-${index}`}
              className={stripCellBorderClass(index)}
            >
              {product ? (
                <ProductStripTile product={product} />
              ) : (
                <ProductStripPlaceholder />
              )}
            </div>
          ))}
        </div>
      </div>
    </Tag>
  );
}
