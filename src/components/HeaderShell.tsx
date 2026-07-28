"use client";

import { type ReactNode, useEffect, useState } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { HeaderActions } from "@/components/HeaderActions";
import { MobileNav } from "@/components/MobileNav";
import { SearchBarPopup } from "@/components/SearchBarPopup";
import { WishlistDrawer } from "@/components/WishlistDrawer";
import { useCart } from "@/components/CartProvider";
import { useWishlist } from "@/components/WishlistProvider";

type HeaderShellProps = {
  logo: ReactNode;
  nav: ReactNode;
};

type HeaderPanel = "search" | "menu" | null;

export function HeaderShell({ logo, nav }: HeaderShellProps) {
  const [panel, setPanel] = useState<HeaderPanel>(null);
  const { cartOpen, closeCart } = useCart();
  const { wishlistOpen, closeWishlist } = useWishlist();

  useEffect(() => {
    if (cartOpen || wishlistOpen) setPanel(null);
  }, [cartOpen, wishlistOpen]);

  function togglePanel(next: Exclude<HeaderPanel, null>) {
    setPanel((current) => {
      const opening = current !== next;
      if (opening) {
        closeCart();
        closeWishlist();
      }
      return opening ? next : null;
    });
  }

  function closePanel() {
    setPanel(null);
  }

  return (
    <>
      <header
        id="site-header"
        className="sticky top-0 z-50 border-b-2 border-ink bg-brand text-ink"
      >
        <div className="relative flex h-14 items-center justify-between px-5 sm:px-8">
          {logo}
          {nav}
          <HeaderActions
            searchOpen={panel === "search"}
            menuOpen={panel === "menu"}
            onSearchClick={() => togglePanel("search")}
            onMenuClick={() => togglePanel("menu")}
          />
        </div>

        <SearchBarPopup
          open={panel === "search"}
          onClose={closePanel}
        />
      </header>

      <MobileNav open={panel === "menu"} onClose={closePanel} logo={logo} />
      <WishlistDrawer />
      <CartDrawer />
    </>
  );
}
