"use client";

import { useMemo, useState } from "react";
import { findVariantByOptions } from "@/lib/product-options";
import {
  getProductDisplayTitle,
  getProductSpecRows,
} from "@/lib/product-specs";
import { getProductBrand } from "@/lib/product-utils";
import type { Image, Product, ProductVariant } from "@/lib/shopify";
import { buildInitialSelection, ProductForm } from "./ProductForm";
import { ProductGallery } from "./ProductGallery";

type ProductDetailProps = {
  product: Product;
};

function buildGalleryImages(
  product: Product,
  variant: ProductVariant | null,
): Image[] {
  const base = product.images.nodes.length
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  if (!variant?.image) return base;

  const withoutVariant = base.filter(
    (image) => image.url !== variant.image!.url,
  );
  return [variant.image, ...withoutVariant];
}

export function ProductDetail({ product }: ProductDetailProps) {
  const variants = product.variants.nodes;
  const brand = getProductBrand(product);
  const { name, collection, color, lens } = getProductDisplayTitle(product);
  const specRows = getProductSpecRows(product);

  const [selected, setSelected] = useState(() =>
    buildInitialSelection(variants),
  );

  const variant =
    findVariantByOptions(variants, selected) ?? variants[0] ?? null;

  const images = useMemo(
    () => buildGalleryImages(product, variant),
    [product, variant],
  );

  function handleSelect(name: string, value: string) {
    setSelected((current) => ({ ...current, [name]: value }));
  }

  return (
    <div>
      {/* Buy block: one viewport on desktop. Specs sit below so the next
          section peeks and signals more to scroll. */}
      <div
        // Same seam model as the footer (`gap-[2px] bg-ink`): centers the 2px
        // ink line on the 50% axis. A `border-l-2` on the right column sits the
        // line entirely to the right of center and misaligns with the footer.
        className="grid gap-[2px] bg-ink md:grid-cols-2 md:h-[calc(100dvh-var(--header-h)-2.75rem)]"
      >
        <div className="min-h-0 bg-cream md:h-full">
          <ProductGallery
            key={variant?.id ?? product.id}
            images={images}
            title={product.title}
          />
        </div>
        <div className="min-h-0 bg-cream md:h-full md:overflow-y-auto">
          <ProductForm
            brand={brand}
            title={name}
            handle={product.handle}
            imageUrl={
              variant?.image?.url ??
              product.featuredImage?.url ??
              product.images.nodes[0]?.url ??
              null
            }
            collection={collection}
            color={color}
            lens={lens}
            variants={variants}
            availableForSale={product.availableForSale}
            selected={selected}
            onSelect={handleSelect}
          />
        </div>
      </div>

      {specRows.length > 0 ? (
        <section className="border-t-2 border-ink bg-cream px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
            Fit &amp; specifications
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {specRows.map((row) => (
              <div key={row.key}>
                <dt className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted">
                  {row.label}
                </dt>
                <dd className="mt-1 text-sm font-semibold text-ink">
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  );
}
