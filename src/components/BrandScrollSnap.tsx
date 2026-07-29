"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { observeSnapHeaderTheme } from "@/lib/header-theme";
import { resetSnapScroll } from "@/lib/snap-scroll";
import { lockSnapViewportHeight } from "@/lib/snap-viewport";

export function BrandScrollSnap() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("snap-scroll");
    document.body.classList.add("snap-scroll-page");
    const unlockSnapVh = lockSnapViewportHeight();
    const stopHeaderTheme = observeSnapHeaderTheme();

    return () => {
      stopHeaderTheme();
      unlockSnapVh();
      document.documentElement.classList.remove(
        "snap-scroll",
        "brand-hero-video-active",
      );
      document.body.classList.remove("snap-scroll-page");
      resetSnapScroll();
    };
  }, []);

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    resetSnapScroll();

    return () => {
      history.scrollRestoration = previous;
    };
  }, [pathname]);

  return null;
}
