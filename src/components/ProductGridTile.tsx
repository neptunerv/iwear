"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { WishlistButton } from "@/components/WishlistButton";
import { formatPriceK } from "@/lib/format";
import { getProductDisplayTitle } from "@/lib/product-specs";
import { getCompareAtPrice } from "@/lib/product-utils";
import type { Product } from "@/lib/shopify";

type ProductImage = {
  url: string;
  altText?: string | null;
};

type ProductGridTileProps = {
  product: Product;
  fill?: boolean;
  /** Show title + price footer. Off for image-led homepage strips. */
  showMeta?: boolean;
};

const MAX_MOBILE_VIEWS = 2;

export function ProductGridTile({
  product,
  fill = false,
  showMeta = true,
}: ProductGridTileProps) {
  const { name: displayTitle } = getProductDisplayTitle(product);
  const views = useMemo(() => {
    const seen = new Set<string>();
    const list: ProductImage[] = [];

    const push = (image: ProductImage | null | undefined) => {
      if (!image?.url || seen.has(image.url)) return;
      seen.add(image.url);
      list.push(image);
    };

    push(product.featuredImage);
    for (const image of product.images.nodes) push(image);
    for (const variant of product.variants.nodes) push(variant.image);

    return list.slice(0, MAX_MOBILE_VIEWS);
  }, [product]);

  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = views.length > 0 ? Math.min(activeIndex, views.length - 1) : 0;
  const mobileImage = views[safeIndex] ?? null;
  const primaryImage = views[0] ?? null;
  const hoverImage = views[1] ?? null;
  const price = product.priceRange.minVariantPrice;
  const compareAt = getCompareAtPrice(product);
  const onSale =
    compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount);
  // Tighter pad so frames read larger in the card.
  const imagePad = fill ? "p-3 sm:p-5 lg:p-6" : "p-4 sm:p-6 lg:p-8";
  const showDots = showMeta && views.length > 1;
  const canSwipe = views.length > 1;

  const swipeSurfaceRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(safeIndex);
  activeIndexRef.current = safeIndex;
  const didSwipeRef = useRef(false);

  useEffect(() => {
    const surface = swipeSurfaceRef.current;
    if (!surface || !canSwipe) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let axis: "undecided" | "x" | "y" = "undecided";

    const endGesture = () => {
      pointerId = null;
      axis = "undecided";
    };

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      axis = "undecided";
      didSwipeRef.current = false;
    };

    const onMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (axis === "undecided") {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";

        if (axis === "y") {
          endGesture();
          return;
        }

        try {
          surface.setPointerCapture(event.pointerId);
        } catch {
          /* ignore */
        }
      }

      if (axis === "x") {
        event.preventDefault();
      }
    };

    const onUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;

      if (axis === "x") {
        const dx = event.clientX - startX;
        const threshold = 40;
        if (Math.abs(dx) >= threshold && views.length > 0) {
          didSwipeRef.current = true;
          const current = activeIndexRef.current;
          const next =
            dx < 0
              ? (current + 1) % views.length
              : (current - 1 + views.length) % views.length;
          setActiveIndex(next);
        }
      }

      try {
        if (surface.hasPointerCapture(event.pointerId)) {
          surface.releasePointerCapture(event.pointerId);
        }
      } catch {
        /* ignore */
      }

      endGesture();
    };

    surface.addEventListener("pointerdown", onDown);
    surface.addEventListener("pointermove", onMove, { passive: false });
    surface.addEventListener("pointerup", onUp);
    surface.addEventListener("pointercancel", onUp);

    return () => {
      surface.removeEventListener("pointerdown", onDown);
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerup", onUp);
      surface.removeEventListener("pointercancel", onUp);
    };
  }, [canSwipe, views.length]);

  return (
    <article
      className={`group relative flex flex-col bg-white ${
        fill ? "h-full min-h-0" : "aspect-[3/4] sm:aspect-square"
      }`}
    >
      <WishlistButton
        item={{
          handle: product.handle,
          title: displayTitle,
          imageUrl: (mobileImage ?? primaryImage)?.url ?? null,
          priceAmount: price.amount,
          priceCurrency: price.currencyCode,
        }}
        openOnSave={false}
        className="absolute right-2 top-2 z-10 bg-white/90 p-1.5"
      />

      {/* Mobile image — swipe between views when available */}
      <div
        ref={swipeSurfaceRef}
        className="relative min-h-0 flex-1 sm:hidden"
        style={{ touchAction: canSwipe ? "pan-y" : undefined }}
      >
        <Link
          href={`/products/${product.handle}`}
          className="absolute inset-0"
          aria-label={displayTitle}
          onClick={(event) => {
            if (didSwipeRef.current) {
              event.preventDefault();
              didSwipeRef.current = false;
            }
          }}
        >
          {mobileImage ? (
            <Image
              src={mobileImage.url}
              alt={mobileImage.altText ?? product.title}
              fill
              sizes="50vw"
              className={`object-contain ${imagePad}`}
              draggable={false}
            />
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
      </div>

      {/* Desktop image — hover swap */}
      <Link
        href={`/products/${product.handle}`}
        className="relative hidden min-h-0 flex-1 sm:block"
        aria-label={displayTitle}
      >
        {primaryImage ? (
          <>
            <Image
              src={primaryImage.url}
              alt={primaryImage.altText ?? product.title}
              fill
              sizes="25vw"
              className={`object-contain transition-opacity duration-500 ${imagePad} ${
                hoverImage ? "group-hover:opacity-0" : ""
              }`}
            />
            {hoverImage ? (
              <Image
                src={hoverImage.url}
                alt={hoverImage.altText ?? product.title}
                fill
                sizes="25vw"
                className={`object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${imagePad}`}
              />
            ) : null}
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

      {showMeta ? (
        <div className="flex shrink-0 flex-col items-start gap-0.5 px-3 py-2 sm:grid sm:grid-cols-[1fr_auto] sm:items-center sm:gap-2 sm:px-4 sm:py-2.5">
          <Link
            href={`/products/${product.handle}`}
            className="line-clamp-2 text-[11px] font-semibold text-ink sm:truncate sm:text-xs"
          >
            {displayTitle}
          </Link>

          <div className="flex w-full items-center justify-between gap-2 sm:contents">
            <span className="text-[11px] font-medium text-ink-muted sm:justify-self-end sm:font-semibold sm:text-ink sm:text-xs">
              {formatPriceK(price.amount)}
              {onSale && compareAt && (
                <span className="ml-1 font-medium text-ink-muted/70 line-through sm:font-semibold">
                  {formatPriceK(compareAt.amount)}
                </span>
              )}
            </span>

            {showDots ? (
              <div
                className="flex items-center gap-1.5 sm:hidden"
                role="tablist"
                aria-label="Product images"
              >
                {views.map((image, index) => {
                  const selected = index === safeIndex;
                  return (
                    <button
                      key={image.url}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      aria-label={`Show image ${index + 1}`}
                      onClick={() => setActiveIndex(index)}
                      className={`h-2 w-2 rounded-full transition-colors ${
                        selected
                          ? "bg-ink"
                          : "border border-ink/50 bg-transparent"
                      }`}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
