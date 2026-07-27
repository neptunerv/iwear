import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getProductDisplayTitle } from "@/lib/product-specs";
import { getCompareAtPrice, getProductBrand } from "@/lib/product-utils";
import type { Product } from "@/lib/shopify";

type ProductSquareProps = {
  product: Product;
};

export function ProductSquare({ product }: ProductSquareProps) {
  const price = product.priceRange.minVariantPrice;
  const compareAt = getCompareAtPrice(product);
  const onSale =
    compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const image = product.featuredImage;
  const hoverImage = product.images.nodes[1] ?? null;
  const brand = getProductBrand(product);
  const { name: displayTitle } = getProductDisplayTitle(product);

  return (
    <Link
      href={`/products/${product.handle}`}
      className="group flex flex-col border-2 border-ink bg-cream transition-colors hover:bg-ink"
    >
      <div className="relative aspect-square overflow-hidden border-b-2 border-ink bg-white">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.altText ?? displayTitle}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className={`object-contain p-4 transition-opacity duration-500 sm:p-5 ${
                hoverImage ? "group-hover:opacity-0" : "group-hover:scale-105"
              }`}
            />
            {hoverImage && (
              <Image
                src={hoverImage.url}
                alt={hoverImage.altText ?? displayTitle}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-contain p-4 opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:p-5"
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center bg-white">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
              No image
            </span>
          </div>
        )}

        {onSale && (
          <span className="absolute left-0 top-0 bg-brand px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-ink">
            Sale
          </span>
        )}

        {!product.availableForSale && (
          <span className="absolute right-0 top-0 bg-ink px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-cream">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-3 py-3 sm:px-4 sm:py-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-ink-muted transition-colors group-hover:text-brand sm:text-xs">
          {brand}
        </p>
        <h3 className="line-clamp-2 text-xs font-bold leading-snug text-ink transition-colors group-hover:text-brand sm:text-sm">
          {displayTitle}
        </h3>
        <div className="mt-auto flex items-baseline gap-2 pt-1">
          <p className="text-sm font-bold text-ink transition-colors group-hover:text-brand">
            {formatPrice(price.amount, price.currencyCode)}
          </p>
          {onSale && compareAt && (
            <p className="text-xs font-semibold text-ink-muted line-through transition-colors group-hover:text-brand/70">
              {formatPrice(compareAt.amount, compareAt.currencyCode)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
