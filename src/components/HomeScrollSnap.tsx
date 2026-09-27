"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  clearHeaderTheme,
  observeSnapHeaderTheme,
  setHeaderTheme,
} from "@/lib/header-theme";
import { resetSnapScroll } from "@/lib/snap-scroll";
import { lockSnapViewportHeight } from "@/lib/snap-viewport";

type HomeScrollSnapProps = {
  /** Cream-only pages (about / legal / account) — always black nav. */
  keepHeaderBorder?: boolean;
  /**
   * Long text pages scroll with the document. Snap panels lock each
   * section to one viewport and clip anything past the fold.
   */
  documentFlow?: boolean;
};

export function HomeScrollSnap({
  keepHeaderBorder = false,
  documentFlow = false,
}: HomeScrollSnapProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (documentFlow) {
      setHeaderTheme("ink");
      return () => {
        clearHeaderTheme();
      };
    }

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
  }, [documentFlow, keepHeaderBorder]);

  useEffect(() => {
    if (documentFlow) return;

    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    resetSnapScroll();

    return () => {
      history.scrollRestoration = previous;
    };
  }, [documentFlow, pathname]);

  return null;
}
