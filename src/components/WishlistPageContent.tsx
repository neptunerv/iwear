"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlist } from "@/components/WishlistProvider";
import { formatPrice } from "@/lib/format";

export function WishlistPageContent() {
  const { items, removeItem } = useWishlist();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <p className="text-sm font-bold uppercase tracking-widest text-ink-muted">
        Wishlist
      </p>
      <h1 className="mt-2 font-poster text-4xl uppercase text-ink">
        Saved frames
      </h1>

      {items.length === 0 ? (
        <div className="mt-12 border-2 border-dashed border-ink/20 px-8 py-16 text-center">
          <p className="font-display text-3xl italic leading-none text-ink-muted sm:text-4xl">
            Nothing saved yet
          </p>
          <p className="mt-3 text-sm font-semibold text-ink-muted">
            Browse the collection and tap the heart to save pairs on this
            device.
          </p>
          <Link
            href="/shop"
            className="mt-8 inline-block border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop all
          </Link>
        </div>
      ) : (
        <ul className="mt-12 divide-y-2 divide-ink/10 border-2 border-ink/15">
          {items.map((item) => (
            <li key={item.handle} className="flex gap-4 px-4 py-5 sm:px-5">
              <Link
                href={`/products/${item.handle}`}
                className="relative h-24 w-24 shrink-0 bg-white"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-contain p-2"
                  />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.handle}`}
                  className="block truncate text-sm font-semibold text-ink hover:opacity-70 sm:text-base"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatPrice(item.priceAmount, item.priceCurrency)}
                </p>
                <div className="mt-3 flex flex-wrap gap-4">
                  <Link
                    href={`/products/${item.handle}`}
                    className="text-[10px] font-bold uppercase tracking-[0.16em] underline underline-offset-4"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeItem(item.handle)}
                    className="text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted underline underline-offset-4"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
