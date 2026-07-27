"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  addToCartAction,
  getCartAction,
  removeCartLineAction,
  updateCartDiscountCodesAction,
  updateCartLineAction,
} from "@/lib/shopify/actions";
import type { Cart } from "@/lib/shopify/cart";

type CartContextValue = {
  cart: Cart | null;
  cartOpen: boolean;
  isPending: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  refreshCart: () => Promise<void>;
  addItem: (
    variantId: string,
    quantity?: number,
  ) => Promise<{ error: string | null }>;
  updateQuantity: (
    lineId: string,
    quantity: number,
  ) => Promise<{ error: string | null }>;
  removeLine: (lineId: string) => Promise<{ error: string | null }>;
  applyDiscountCodes: (
    codes: string[],
  ) => Promise<{ error: string | null }>;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
  initialCart?: Cart | null;
};

export function CartProvider({
  children,
  initialCart = null,
}: CartProviderProps) {
  const [cart, setCart] = useState<Cart | null>(initialCart);
  const [cartOpen, setCartOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const refreshCart = useCallback(async () => {
    const next = await getCartAction();
    setCart(next);
  }, []);

  const openCart = useCallback(() => setCartOpen(true), []);
  const closeCart = useCallback(() => setCartOpen(false), []);
  const toggleCart = useCallback(
    () => setCartOpen((open) => !open),
    [],
  );

  const addItem = useCallback(async (variantId: string, quantity = 1) => {
    const result = await addToCartAction(variantId, quantity);
    if (result.error) return { error: result.error };

    setCart(result.cart);
    setCartOpen(true);
    return { error: null };
  }, []);

  const updateQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      return new Promise<{ error: string | null }>((resolve) => {
        startTransition(async () => {
          const result =
            quantity <= 0
              ? await removeCartLineAction(lineId)
              : await updateCartLineAction(lineId, quantity);

          if (result.error) {
            await refreshCart();
            resolve({ error: result.error });
            return;
          }

          setCart(result.cart);
          resolve({ error: null });
        });
      });
    },
    [refreshCart],
  );

  const removeLine = useCallback(
    async (lineId: string) => updateQuantity(lineId, 0),
    [updateQuantity],
  );

  const applyDiscountCodes = useCallback(async (codes: string[]) => {
    return new Promise<{ error: string | null }>((resolve) => {
      startTransition(async () => {
        const result = await updateCartDiscountCodesAction(codes);
        if (result.cart) setCart(result.cart);
        else await refreshCart();
        resolve({ error: result.error });
      });
    });
  }, [refreshCart]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartOpen,
        isPending,
        openCart,
        closeCart,
        toggleCart,
        refreshCart,
        addItem,
        updateQuantity,
        removeLine,
        applyDiscountCodes,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within CartProvider");
  }
  return value;
}
