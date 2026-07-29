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
    // Same seam model as the footer (`gap-[1.5px] bg-ink`): centers the 1.5px
    // ink line on the 50% axis. A `border-l` on the right column sits the
    // line entirely to the right of center and misaligns with the footer.
    <div className="grid gap-[1.5px] bg-ink md:grid-cols-2">
      <div className="bg-cream">
        <ProductGallery
          key={variant?.id ?? product.id}
          images={images}
          title={product.title}
        />
      </div>
      <div className="bg-cream">
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
          specRows={specRows}
          variants={variants}
          availableForSale={product.availableForSale}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
}
