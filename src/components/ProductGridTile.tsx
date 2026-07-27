"use client";

import Image from "next/image";
import Link from "next/link";
import { WishlistButton } from "@/components/WishlistButton";
import { formatPrice } from "@/lib/format";
import { getProductDisplayTitle } from "@/lib/product-specs";
import { getCompareAtPrice } from "@/lib/product-utils";
import type { Product } from "@/lib/shopify";

type ProductGridTileProps = {
  product: Product;
  fill?: boolean;
};

export function ProductGridTile({
  product,
  fill = false,
}: ProductGridTileProps) {
  const { name: displayTitle } = getProductDisplayTitle(product);
  const image =
    product.featuredImage ??
    product.images.nodes[0] ??
    product.variants.nodes.find((variant) => variant.image)?.image ??
    null;
  const hoverImage = product.images.nodes[1] ?? null;
  const price = product.priceRange.minVariantPrice;
  const compareAt = getCompareAtPrice(product);
  const onSale =
    compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  const imagePad = fill
    ? "p-4 sm:p-6 lg:p-8"
    : "p-8 sm:p-10 lg:p-12";

  return (
    <article
      className={`group relative flex flex-col bg-white ${
        fill ? "h-full min-h-0" : "aspect-square"
      }`}
    >
      <WishlistButton
        item={{
          handle: product.handle,
          title: displayTitle,
          imageUrl: image?.url ?? null,
          priceAmount: price.amount,
          priceCurrency: price.currencyCode,
        }}
        openOnSave={false}
        className="absolute right-2 top-2 z-10 bg-white/90 p-1.5"
      />

      <Link
        href={`/products/${product.handle}`}
        className="relative min-h-0 flex-1"
        aria-label={displayTitle}
      >
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.altText ?? product.title}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className={`object-contain transition-opacity duration-500 ${imagePad} ${
                hoverImage ? "group-hover:opacity-0" : ""
              }`}
            />
            {hoverImage && (
              <Image
                src={hoverImage.url}
                alt={hoverImage.altText ?? product.title}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className={`object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${imagePad}`}
              />
            )}
          </>
        ) : (
          <div className="flex h-full items-center justify-center">
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
      </Link>

      <div className="grid shrink-0 grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5">
        <Link
          href={`/products/${product.handle}`}
          className="truncate text-[11px] font-semibold text-ink sm:text-xs"
        >
          {displayTitle}
        </Link>

        <span className="justify-self-end text-[11px] font-semibold text-ink sm:text-xs">
          {formatPrice(price.amount, price.currencyCode)}
          {onSale && compareAt && (
            <span className="ml-1 font-semibold text-ink-muted line-through">
              {formatPrice(compareAt.amount, compareAt.currencyCode)}
            </span>
          )}
        </span>
      </div>
    </article>
  );
}
