"use client";

import { CartProvider } from "@/components/CartProvider";
import { NavigationProgress } from "@/components/NavigationProgress";
import { WishlistProvider } from "@/components/WishlistProvider";
import type { Cart } from "@/lib/shopify/cart";
import type { ReactNode } from "react";

type ProvidersProps = {
  children: ReactNode;
  initialCart: Cart | null;
};

export function Providers({ children, initialCart }: ProvidersProps) {
  return (
    <CartProvider initialCart={initialCart}>
      <WishlistProvider>
        <NavigationProgress />
        {children}
      </WishlistProvider>
    </CartProvider>
  );
}
