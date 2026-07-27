"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

    return () => {
      document.documentElement.classList.remove("snap-scroll");
      document.documentElement.classList.remove("snap-scroll-proximity");
      document.body.classList.remove("snap-scroll-page");
      window.scrollTo(0, 0);
    };
  }, [proximity]);

  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    return () => {
      history.scrollRestoration = previous;
    };
  }, [pathname]);

  return null;
}
