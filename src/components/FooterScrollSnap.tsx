"use client";

import { useEffect } from "react";

/**
 * Enables document scroll-snap for viewport footers so the info + wordmark
 * panels snap on every page (including shop, where the rest of the page
 * has no snap sections).
 */
export function FooterScrollSnap() {
  useEffect(() => {
    const root = document.documentElement;
    const already = root.classList.contains("snap-scroll");

    if (!already) {
      root.classList.add("snap-scroll");
      document.body.classList.add("snap-scroll-page");
    }

    return () => {
      if (!already) {
        root.classList.remove("snap-scroll");
        document.body.classList.remove("snap-scroll-page");
      }
    };
  }, []);

  return null;
}
