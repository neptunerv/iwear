"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { resetSnapScroll } from "@/lib/snap-scroll";
import { lockSnapViewportHeight } from "@/lib/snap-viewport";

type ScrollSnapProps = {
  proximity?: boolean;
};

export function ScrollSnap({ proximity = false }: ScrollSnapProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("snap-scroll");
    if (proximity) {
      document.documentElement.classList.add("snap-scroll-proximity");
    }
    document.body.classList.add("snap-scroll-page");
    const unlockSnapVh = lockSnapViewportHeight();

    return () => {
      unlockSnapVh();
      document.documentElement.classList.remove("snap-scroll");
      document.documentElement.classList.remove("snap-scroll-proximity");
      document.body.classList.remove("snap-scroll-page");
      resetSnapScroll();
    };
  }, [proximity]);

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
