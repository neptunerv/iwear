"use client";

import { useEffect } from "react";
import { lockSnapViewportHeight } from "@/lib/snap-viewport";

/**
 * Enables document scroll-snap for viewport footers when the page-level
 * snap helper isn’t already mounted. Snap pages (home, brand) usually
 * enable this themselves — this is a safety net for `Footer viewport snap`.
 */
export function FooterScrollSnap() {
  useEffect(() => {
    const root = document.documentElement;
    const already = root.classList.contains("snap-scroll");
    const unlockSnapVh = lockSnapViewportHeight();

    if (!already) {
      root.classList.add("snap-scroll");
      document.body.classList.add("snap-scroll-page");
    }

    return () => {
      unlockSnapVh();
      if (!already) {
        root.classList.remove("snap-scroll");
        document.body.classList.remove("snap-scroll-page");
      }
    };
  }, []);

  return null;
}
