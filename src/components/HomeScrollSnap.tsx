"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getSnapScrollRoot, resetSnapScroll } from "@/lib/snap-scroll";
import { lockSnapViewportHeight } from "@/lib/snap-viewport";

function setHeaderBorderVisible(visible: boolean) {
  const header = document.getElementById("site-header");
  if (!header) return;

  if (visible) {
    header.classList.remove("border-b-transparent");
    header.classList.add("border-ink");
  } else {
    header.classList.add("border-b-transparent");
    header.classList.remove("border-ink");
  }
}

type HomeScrollSnapProps = {
  /** Keep the header bottom border over the hero (cream pages). */
  keepHeaderBorder?: boolean;
};

export function HomeScrollSnap({
  keepHeaderBorder = false,
}: HomeScrollSnapProps) {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("snap-scroll");
    document.body.classList.add("snap-scroll-page");
    setHeaderBorderVisible(true);
    const unlockSnapVh = lockSnapViewportHeight();

    if (keepHeaderBorder) {
      return () => {
        unlockSnapVh();
        document.documentElement.classList.remove("snap-scroll");
        document.body.classList.remove("snap-scroll-page");
        document.body.classList.remove("scrolled");
        setHeaderBorderVisible(true);
        resetSnapScroll();
      };
    }

    const hero = document.getElementById("hero");
    const header = document.getElementById("site-header");
    if (!hero || !header) {
      return () => {
        unlockSnapVh();
        document.documentElement.classList.remove("snap-scroll");
        document.body.classList.remove("snap-scroll-page");
        document.body.classList.remove("scrolled");
        setHeaderBorderVisible(true);
        resetSnapScroll();
      };
    }

    const headerHeight = header.getBoundingClientRect().height;
    const scrollRoot = getSnapScrollRoot();

    const observer = new IntersectionObserver(
      ([entry]) => {
        const heroInView =
          entry.isIntersecting && entry.intersectionRatio > 0.5;
        setHeaderBorderVisible(!heroInView);
        document.body.classList.toggle("scrolled", !heroInView);
      },
      {
        root: scrollRoot,
        // Header sits outside #site-main on mobile, so no top inset there.
        rootMargin: scrollRoot ? "0px" : `-${headerHeight}px 0px 0px 0px`,
        threshold: [0, 0.5, 1],
      },
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
      unlockSnapVh();
      document.documentElement.classList.remove("snap-scroll");
      document.body.classList.remove("snap-scroll-page");
      document.body.classList.remove("scrolled");
      setHeaderBorderVisible(true);
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
