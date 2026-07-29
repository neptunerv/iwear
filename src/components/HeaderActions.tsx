"use client";

import Link from "next/link";
import {
  BagIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "@/components/icons";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";

const iconClassName = "h-5 w-5";

type HeaderActionsProps = {
  onSearchClick?: () => void;
  onMenuClick?: () => void;
  searchOpen?: boolean;
  menuOpen?: boolean;
};

export function HeaderActions({
  onSearchClick,
  onMenuClick,
  searchOpen,
  menuOpen,
}: HeaderActionsProps) {
  const { cart, cartOpen, toggleCart } = useCart();
  const { items, wishlistOpen, toggleWishlist } = useWishlist();
  const cartCount = cart?.totalQuantity ?? 0;
  const wishlistCount = items.length;

  const linkClassName = "cursor-pointer transition-opacity hover:opacity-60";

  function actionClassName(open?: boolean) {
    return `${linkClassName}${open ? " opacity-60" : ""}`;
  }

  return (
    <div className="flex shrink-0 items-center gap-4 sm:gap-5">
      {/* Mobile: hamburger only */}
      <button
        type="button"
        aria-label={menuOpen ? "Close menu" : "Open menu"}
        aria-expanded={menuOpen}
        onClick={onMenuClick}
        className={`md:hidden ${actionClassName(menuOpen)}`}
      >
        <MenuIcon className={iconClassName} />
      </button>

      {/* Desktop: utility actions */}
      <button
        type="button"
        aria-label="Search"
        aria-expanded={searchOpen}
        onClick={onSearchClick}
        className={`hidden md:inline-flex ${actionClassName(searchOpen)}`}
      >
        <SearchIcon className={iconClassName} />
      </button>

      <Link
        href="/account"
        aria-label="Account"
        className={`hidden md:inline-flex ${linkClassName}`}
      >
        <UserIcon className={iconClassName} />
      </Link>

      <button
        type="button"
        aria-label={
          wishlistCount > 0 ? `Wishlist (${wishlistCount})` : "Wishlist"
        }
        aria-expanded={wishlistOpen}
        onClick={toggleWishlist}
        className={`relative hidden md:inline-flex ${actionClassName(wishlistOpen)}`}
      >
        <HeartIcon className={iconClassName} />
        {wishlistCount > 0 ? (
          <span className="header-badge absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-[9px] font-bold leading-none text-cream">
            {wishlistCount > 99 ? "99+" : wishlistCount}
          </span>
        ) : null}
      </button>

      <button
        type="button"
        aria-label={cartCount > 0 ? `Cart (${cartCount})` : "Cart"}
        aria-expanded={cartOpen}
        onClick={toggleCart}
        className={`relative hidden md:inline-flex ${actionClassName(cartOpen)}`}
      >
        <BagIcon className={iconClassName} />
        {cartCount > 0 ? (
          <span className="header-badge absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center bg-ink px-1 text-[9px] font-bold leading-none text-cream">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        ) : null}
      </button>

      <Link href="/cart" className="sr-only">
        View bag
      </Link>
    </div>
  );
}
