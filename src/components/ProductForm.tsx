"use client";

import { useMemo, useState, useTransition } from "react";
import { useCart } from "@/components/CartProvider";
import { InStoreAvailabilityNote } from "@/components/InStoreAvailabilityNote";
import { WishlistButton } from "@/components/WishlistButton";
import { formatPrice } from "@/lib/format";
import {
  findVariantByOptions,
  getProductOptions,
} from "@/lib/product-options";
import type { ProductSpecRow } from "@/lib/product-specs";
import type { ProductVariant } from "@/lib/shopify";

type ProductFormProps = {
  brand: string;
  title: string;
  handle: string;
  imageUrl: string | null;
  collection: string | null;
  color: string | null;
  lens: string | null;
  specRows: ProductSpecRow[];
  variants: ProductVariant[];
  availableForSale: boolean;
  selected: Record<string, string>;
  onSelect: (name: string, value: string) => void;
};

export function ProductForm({
  brand,
  title,
  handle,
  imageUrl,
  collection,
  color,
  lens,
  specRows,
  variants,
  availableForSale,
  selected,
  onSelect,
}: ProductFormProps) {
  const options = useMemo(() => getProductOptions(variants), [variants]);
  const { addItem } = useCart();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const variant =
    findVariantByOptions(variants, selected) ?? variants[0] ?? null;

  const onSale =
    variant?.compareAtPrice &&
    parseFloat(variant.compareAtPrice.amount) >
      parseFloat(variant.price.amount);

  function handleSelect(name: string, value: string) {
    onSelect(name, value);
    setError(null);
  }

  function handleAddToCart() {
    if (!variant) return;

    setError(null);
    startTransition(async () => {
      const result = await addItem(variant.id);
      if (result.error) setError(result.error);
    });
  }

  const soldOut = !availableForSale || !variant?.availableForSale;
  const quantityAvailable = variant?.quantityAvailable;
  const lowStock =
    !soldOut &&
    typeof quantityAvailable === "number" &&
    quantityAvailable > 0 &&
    quantityAvailable <= 3;
  const wishlistItem = {
    handle,
    title,
    imageUrl,
    priceAmount: variant?.price.amount ?? "0",
    priceCurrency: variant?.price.currencyCode ?? "IDR",
  };

  return (
    <div className="flex flex-col gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
          {brand}
        </p>
        <h1 className="mt-2 font-display text-3xl leading-tight text-ink sm:text-4xl">
          {title}
        </h1>
        {collection ? (
          <p className="mt-2 text-sm font-semibold leading-relaxed text-ink-muted">
            {collection}
          </p>
        ) : null}
        {color ? (
          <p className="mt-1 text-sm font-semibold leading-relaxed text-ink">
            <span className="text-ink-muted">Color · </span>
            {color}
          </p>
        ) : null}
        {lens ? (
          <p className="mt-1 text-sm font-semibold leading-relaxed text-ink">
            <span className="text-ink-muted">Lens · </span>
            {lens}
          </p>
        ) : null}
      </div>

      {variant && (
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <p className="font-poster text-3xl uppercase leading-none text-ink sm:text-4xl">
            {formatPrice(variant.price.amount, variant.price.currencyCode)}
          </p>
          {onSale && variant.compareAtPrice && (
            <p className="text-lg font-semibold text-ink-muted line-through">
              {formatPrice(
                variant.compareAtPrice.amount,
                variant.compareAtPrice.currencyCode,
              )}
            </p>
          )}
        </div>
      )}

      {options.map((option) => (
        <div key={option.name}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
            {option.name}
          </p>
          <div className="flex flex-wrap gap-2">
            {option.values.map((value) => {
              const isSelected = selected[option.name] === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(option.name, value)}
                  className={`border px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] transition-colors sm:text-sm ${
                    isSelected
                      ? "border-ink bg-ink text-cream"
                      : "border-ink/20 bg-cream text-ink hover:border-ink"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex flex-col gap-3">
        {lowStock ? (
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand">
            Only {quantityAvailable} left in stock
          </p>
        ) : null}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={soldOut || isPending}
            className="min-w-0 flex-1 border border-ink bg-brand px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-cream disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {isPending ? "Adding…" : soldOut ? "Sold out" : "Add to bag"}
          </button>
          <WishlistButton
            item={wishlistItem}
            className="flex items-center justify-center border border-ink px-4"
          />
        </div>

        {error && (
          <p className="text-sm font-semibold text-brand" role="alert">
            {error}
          </p>
        )}
      </div>

      {specRows.length > 0 ? (
        <div className="border-t border-ink/15 pt-6">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
            Fit &amp; specifications
          </p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
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
        </div>
      ) : null}

      <ul className="space-y-3 border-t border-ink/15 pt-6 text-sm font-semibold text-ink-muted">
        <li>Full manufacturer warranty on every frame</li>
        <li>Free delivery across Bali · international shipping at checkout</li>
        <li>
          <InStoreAvailabilityNote />
        </li>
      </ul>
    </div>
  );
}

export function buildInitialSelection(variants: ProductVariant[]) {
  const first = variants[0];
  if (!first) return {};

  return Object.fromEntries(
    first.selectedOptions
      .filter(
        (option) =>
          !(option.name === "Title" && option.value === "Default Title"),
      )
      .map((option) => [option.name, option.value]),
  );
}
