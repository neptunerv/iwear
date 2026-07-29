"use client";

import Image from "next/image";
import Link from "next/link";
import { SideDrawer } from "@/components/SideDrawer";
import { useWishlist } from "@/components/WishlistProvider";
import { formatPrice } from "@/lib/format";

export function WishlistDrawer() {
  const { items, wishlistOpen, closeWishlist, removeItem } = useWishlist();
  const title =
    items.length > 0 ? `Wishlist (${items.length})` : "Wishlist";

  return (
    <SideDrawer open={wishlistOpen} onClose={closeWishlist} title={title}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center px-4 py-12 text-center sm:px-5 sm:py-16">
          <p className="font-display text-3xl italic leading-none text-ink-muted sm:text-4xl">
            Nothing saved yet
          </p>
          <p className="mt-3 text-sm font-semibold text-ink-muted">
            Browse the collection and save your favourite pairs here.
          </p>
          <Link
            href="/shop"
            onClick={closeWishlist}
            className="mt-8 border border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Shop all
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-ink/10 px-4 sm:px-5">
          {items.map((item) => (
            <li key={item.handle} className="flex gap-3 py-4">
              <Link
                href={`/products/${item.handle}`}
                onClick={closeWishlist}
                className="relative h-20 w-20 shrink-0 bg-white"
              >
                {item.imageUrl ? (
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : null}
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/products/${item.handle}`}
                  onClick={closeWishlist}
                  className="block truncate text-sm font-semibold text-ink hover:opacity-70"
                >
                  {item.title}
                </Link>
                <p className="mt-1 text-sm font-semibold text-ink">
                  {formatPrice(item.priceAmount, item.priceCurrency)}
                </p>
                <button
                  type="button"
                  onClick={() => removeItem(item.handle)}
                  className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted underline underline-offset-4"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </SideDrawer>
  );
}
