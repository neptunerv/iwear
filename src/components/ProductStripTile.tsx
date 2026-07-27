import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { getProductDisplayTitle } from "@/lib/product-specs";
import { getCompareAtPrice, getProductBrand } from "@/lib/product-utils";
import type { Product } from "@/lib/shopify";

type ProductStripTileProps = {
  product: Product;
  fill?: boolean;
};

export function ProductStripTile({ product, fill = false }: ProductStripTileProps) {
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
      className={`group relative block overflow-hidden bg-white ${fill ? "h-full" : "aspect-square"}`}
    >
      {image ? (
        <>
          <Image
            src={image.url}
            alt={image.altText ?? displayTitle}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className={`object-contain p-6 transition-opacity duration-500 sm:p-8 ${
              hoverImage ? "group-hover:opacity-0" : "group-hover:scale-[1.03]"
            }`}
          />
          {hoverImage && (
            <Image
              src={hoverImage.url}
              alt={hoverImage.altText ?? displayTitle}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-6 opacity-0 transition-opacity duration-500 group-hover:opacity-100 sm:p-8"
            />
          )}
        </>
      ) : (
        <div className="flex h-full items-center justify-center bg-white">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
            No image
          </span>
        </div>
      )}

      {!product.availableForSale && (
        <span className="absolute left-0 top-0 bg-ink px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-cream">
          Sold out
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 translate-y-full border-t-2 border-ink bg-cream px-3 py-2.5 transition-transform duration-300 group-hover:translate-y-0 sm:px-4 sm:py-3">
        {onSale && (
          <span className="absolute right-0 top-0 bg-brand px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-ink">
            Sale
          </span>
        )}

        <div className="min-w-0 pr-14">
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-ink-muted sm:text-[10px]">
            {brand}
          </p>
          <p className="mt-0.5 line-clamp-1 text-xs font-bold text-ink sm:text-sm">
            {displayTitle}
          </p>
          <p className="mt-1 text-xs font-bold text-ink">
            {formatPrice(price.amount, price.currencyCode)}
            {onSale && compareAt && (
              <span className="ml-2 font-semibold text-ink-muted line-through">
                {formatPrice(compareAt.amount, compareAt.currencyCode)}
              </span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}
