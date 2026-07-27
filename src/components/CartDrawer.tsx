"use client";

import { CartView } from "@/components/CartView";
import { SideDrawer } from "@/components/SideDrawer";
import { useCart } from "@/components/CartProvider";

export function CartDrawer() {
  const { cartOpen, closeCart, cart } = useCart();
  const count = cart?.totalQuantity ?? 0;
  const title = count > 0 ? `Cart (${count})` : "Cart";

  return (
    <SideDrawer open={cartOpen} onClose={closeCart} title={title}>
      <CartView compact onNavigate={closeCart} />
    </SideDrawer>
  );
}
