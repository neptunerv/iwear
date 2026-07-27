"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

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

    if (keepHeaderBorder) {
      return () => {
        document.documentElement.classList.remove("snap-scroll");
        document.body.classList.remove("snap-scroll-page");
        document.body.classList.remove("scrolled");
        setHeaderBorderVisible(true);
        window.scrollTo(0, 0);
      };
    }

    const hero = document.getElementById("hero");
    const header = document.getElementById("site-header");
    if (!hero || !header) {
      return () => {
        document.documentElement.classList.remove("snap-scroll");
        document.body.classList.remove("snap-scroll-page");
        document.body.classList.remove("scrolled");
        setHeaderBorderVisible(true);
        window.scrollTo(0, 0);
      };
    }

    const headerHeight = header.getBoundingClientRect().height;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const heroInView =
          entry.isIntersecting && entry.intersectionRatio > 0.5;
        setHeaderBorderVisible(!heroInView);
        document.body.classList.toggle("scrolled", !heroInView);
      },
      {
        rootMargin: `-${headerHeight}px 0px 0px 0px`,
        threshold: [0, 0.5, 1],
      },
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("snap-scroll");
      document.body.classList.remove("snap-scroll-page");
      document.body.classList.remove("scrolled");
      setHeaderBorderVisible(true);
      window.scrollTo(0, 0);
    };
  }, [keepHeaderBorder]);

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
