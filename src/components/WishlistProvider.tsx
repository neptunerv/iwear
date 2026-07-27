"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type WishlistItem = {
  handle: string;
  title: string;
  imageUrl: string | null;
  priceAmount: string;
  priceCurrency: string;
};

type WishlistContextValue = {
  items: WishlistItem[];
  wishlistOpen: boolean;
  openWishlist: () => void;
  closeWishlist: () => void;
  toggleWishlist: () => void;
  isSaved: (handle: string) => boolean;
  toggleItem: (item: WishlistItem) => void;
  removeItem: (handle: string) => void;
};

const STORAGE_KEY = "iwear_wishlist";

const WishlistContext = createContext<WishlistContextValue | null>(null);

function readStorage(): WishlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WishlistItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(items: WishlistItem[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeStorage(items);
  }, [items, ready]);

  const openWishlist = useCallback(() => setWishlistOpen(true), []);
  const closeWishlist = useCallback(() => setWishlistOpen(false), []);
  const toggleWishlist = useCallback(
    () => setWishlistOpen((open) => !open),
    [],
  );

  const isSaved = useCallback(
    (handle: string) => items.some((item) => item.handle === handle),
    [items],
  );

  const toggleItem = useCallback((item: WishlistItem) => {
    setItems((current) => {
      const exists = current.some((entry) => entry.handle === item.handle);
      if (exists) {
        return current.filter((entry) => entry.handle !== item.handle);
      }
      return [item, ...current];
    });
  }, []);

  const removeItem = useCallback((handle: string) => {
    setItems((current) => current.filter((item) => item.handle !== handle));
  }, []);

  const value = useMemo(
    () => ({
      items,
      wishlistOpen,
      openWishlist,
      closeWishlist,
      toggleWishlist,
      isSaved,
      toggleItem,
      removeItem,
    }),
    [
      items,
      wishlistOpen,
      openWishlist,
      closeWishlist,
      toggleWishlist,
      isSaved,
      toggleItem,
      removeItem,
    ],
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const value = useContext(WishlistContext);
  if (!value) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return value;
}
