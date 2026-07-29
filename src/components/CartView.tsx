"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useCart } from "@/components/CartProvider";
import { formatPrice } from "@/lib/format";
import type { CartLine } from "@/lib/shopify/cart";
import { site } from "@/lib/site";

type CartViewProps = {
  compact?: boolean;
  onNavigate?: () => void;
};

function lineImage(line: CartLine) {
  return (
    line.merchandise.image ??
    line.merchandise.product.featuredImage ??
    null
  );
}

function lineTitle(line: CartLine) {
  const product = line.merchandise.product.title;
  const variant = line.merchandise.title;
  if (!variant || variant === "Default Title") return product;
  return `${product} · ${variant}`;
}

export function CartView({ compact = false, onNavigate }: CartViewProps) {
  const { cart, isPending, updateQuantity, removeLine, applyDiscountCodes } =
    useCart();
  const [error, setError] = useState<string | null>(null);
  const [discountInput, setDiscountInput] = useState("");
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const lines = cart?.lines ?? [];
  const empty = !cart || lines.length === 0;
  const activeCodes = cart?.discountCodes.filter((code) => code.applicable) ?? [];

  async function handleQuantity(lineId: string, quantity: number) {
    setError(null);
    const result = await updateQuantity(lineId, quantity);
    if (result.error) setError(result.error);
  }

  async function handleRemove(lineId: string) {
    setError(null);
    const result = await removeLine(lineId);
    if (result.error) setError(result.error);
  }

  async function handleApplyDiscount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setDiscountMessage(null);

    const code = discountInput.trim();
    if (!code) {
      setDiscountMessage("Enter a discount code.");
      return;
    }

    const nextCodes = Array.from(
      new Set([...activeCodes.map((item) => item.code), code]),
    );
    const result = await applyDiscountCodes(nextCodes);
    if (result.error) {
      setError(result.error);
      return;
    }

    setDiscountInput("");
    setDiscountMessage(`Code “${code}” applied.`);
  }

  async function handleRemoveDiscount(code: string) {
    setError(null);
    setDiscountMessage(null);
    const nextCodes = activeCodes
      .map((item) => item.code)
      .filter((item) => item.toLowerCase() !== code.toLowerCase());
    const result = await applyDiscountCodes(nextCodes);
    if (result.error) setError(result.error);
  }

  if (empty || !cart) {
    return (
      <div
        className={`flex flex-col items-center text-center ${
          compact ? "px-4 py-12 sm:px-5 sm:py-16" : "border border-dashed border-ink/20 px-8 py-16"
        }`}
      >
        <p className="font-display text-3xl italic leading-none text-ink-muted sm:text-4xl">
          Your bag is empty
        </p>
        <p className="mt-3 text-sm font-semibold text-ink-muted">
          Browse the collection and add a pair when you find the right fit.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/shop"
            onClick={onNavigate}
            className="border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop all
          </Link>
          <Link
            href="/stores"
            onClick={onNavigate}
            className="border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Find a store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-full flex-col ${compact ? "" : "gap-8"}`}>
      <ul
        className={`divide-y divide-ink/10 ${
          compact ? "flex-1 overflow-y-auto px-4 sm:px-5" : "space-y-0 border border-ink/15"
        }`}
      >
        {lines.map((line) => {
          const image = lineImage(line);
          const qtyAvailable = line.merchandise.quantityAvailable;
          const lowStock =
            typeof qtyAvailable === "number" &&
            qtyAvailable > 0 &&
            qtyAvailable <= 3;

          return (
            <li
              key={line.id}
              className={`flex gap-3 py-4 ${compact ? "" : "px-4 sm:px-5"}`}
            >
              <Link
                href={`/products/${line.merchandise.product.handle}`}
                onClick={onNavigate}
                className="relative h-20 w-20 shrink-0 bg-white sm:h-24 sm:w-24"
              >
                {image ? (
                  <Image
                    src={image.url}
                    alt={image.altText ?? lineTitle(line)}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : null}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${line.merchandise.product.handle}`}
                  onClick={onNavigate}
                  className="block truncate text-sm font-semibold text-ink hover:opacity-70"
                >
                  {lineTitle(line)}
                </Link>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatPrice(
                    line.cost.totalAmount.amount,
                    line.cost.totalAmount.currencyCode,
                  )}
                </p>
                {lowStock ? (
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-brand">
                    Only {qtyAvailable} left
                  </p>
                ) : null}

                <div className="mt-3 flex items-center gap-3">
                  <div className="flex items-center border border-ink">
                    <button
                      type="button"
                      aria-label="Decrease quantity"
                      disabled={isPending}
                      onClick={() =>
                        handleQuantity(line.id, line.quantity - 1)
                      }
                      className="px-2.5 py-1 text-sm font-bold disabled:opacity-50"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-xs font-bold">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase quantity"
                      disabled={
                        isPending ||
                        (typeof qtyAvailable === "number" &&
                          line.quantity >= qtyAvailable)
                      }
                      onClick={() =>
                        handleQuantity(line.id, line.quantity + 1)
                      }
                      className="px-2.5 py-1 text-sm font-bold disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRemove(line.id)}
                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted underline underline-offset-4 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div
        className={`shrink-0 border-t border-ink ${
          compact ? "bg-cream px-4 py-4 sm:px-5" : "pt-6"
        }`}
      >
        <form onSubmit={handleApplyDiscount} className="mb-4">
          <label
            htmlFor={compact ? "cart-discount-compact" : "cart-discount"}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted"
          >
            Discount code
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id={compact ? "cart-discount-compact" : "cart-discount"}
              type="text"
              value={discountInput}
              onChange={(event) => setDiscountInput(event.target.value)}
              placeholder="Enter code"
              className="min-w-0 flex-1 border border-ink/20 bg-transparent px-3 py-2 text-sm font-semibold text-ink outline-none placeholder:text-ink-muted focus:border-ink"
            />
            <button
              type="submit"
              disabled={isPending}
              className="shrink-0 border border-ink px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-brand disabled:opacity-50"
            >
              Apply
            </button>
          </div>
          {activeCodes.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2">
              {activeCodes.map((code) => (
                <li key={code.code}>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleRemoveDiscount(code.code)}
                    className="border border-ink bg-ink px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-cream disabled:opacity-50"
                  >
                    {code.code} ×
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {discountMessage ? (
            <p className="mt-2 text-xs font-semibold text-ink-muted" role="status">
              {discountMessage}
            </p>
          ) : null}
        </form>

        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
            Subtotal
          </p>
          <p className="font-poster text-2xl uppercase text-ink">
            {formatPrice(
              cart.cost.subtotalAmount.amount,
              cart.cost.subtotalAmount.currencyCode,
            )}
          </p>
        </div>
        {cart.discountAmount ? (
          <div className="mt-1 flex items-baseline justify-between gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
              Discount
            </p>
            <p className="text-sm font-semibold text-brand">
              −
              {formatPrice(
                cart.discountAmount.amount,
                cart.discountAmount.currencyCode,
              )}
            </p>
          </div>
        ) : null}
        <p className="mt-1 text-xs font-semibold text-ink-muted">
          Shipping and taxes calculated at checkout.
        </p>

        {error ? (
          <p className="mt-3 text-sm font-semibold text-brand" role="alert">
            {error}
          </p>
        ) : null}

        <a
          href={cart.checkoutUrl}
          className="mt-4 flex w-full items-center justify-center border border-ink bg-ink px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-brand hover:text-ink"
        >
          Checkout
        </a>

        <ul className="mt-4 space-y-1.5 text-[11px] font-semibold leading-relaxed text-ink-muted">
          <li>Secure checkout powered by Shopify</li>
          <li>Order confirmation email after payment</li>
          <li>
            Need help?{" "}
            <a
              href={site.messageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-ink"
            >
              {site.whatsappLabel}
            </a>
          </li>
        </ul>

        {compact ? (
          <Link
            href="/cart"
            onClick={onNavigate}
            className="mt-3 flex w-full items-center justify-center border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            View bag
          </Link>
        ) : null}
      </div>
    </div>
  );
}
