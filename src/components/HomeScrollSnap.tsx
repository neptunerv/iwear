"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { observeSnapHeaderTheme } from "@/lib/header-theme";
import { resetSnapScroll } from "@/lib/snap-scroll";
import { lockSnapViewportHeight } from "@/lib/snap-viewport";

type HomeScrollSnapProps = {
  /** Cream-only pages (about / legal / account) — always black nav. */
  keepHeaderBorder?: boolean;
};

export function HomeScrollSnap({
  keepHeaderBorder = false,
}: HomeScrollSnapProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("snap-scroll");
    document.body.classList.add("snap-scroll-page");
    const unlockSnapVh = lockSnapViewportHeight();
    const stopHeaderTheme = observeSnapHeaderTheme(
      keepHeaderBorder ? { forceTheme: "ink" } : undefined,
    );

    return () => {
      stopHeaderTheme();
      unlockSnapVh();
      document.documentElement.classList.remove("snap-scroll");
      document.body.classList.remove("snap-scroll-page");
      document.body.classList.remove("scrolled");
      resetSnapScroll();
    };
  }, [keepHeaderBorder]);

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
