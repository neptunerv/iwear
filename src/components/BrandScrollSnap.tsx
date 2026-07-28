"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getSnapScrollRoot, resetSnapScroll } from "@/lib/snap-scroll";
import { lockSnapViewportHeight } from "@/lib/snap-viewport";

type HeroTheme = "dark" | "light";

function setBrandHeroHeader(active: boolean, theme: HeroTheme) {
  const header = document.getElementById("site-header");
  if (!header) return;

  header.classList.remove("header-ghost", "header-ghost-dark", "header-ghost-light");

  if (active) {
    header.classList.add("header-ghost");
    header.classList.add(theme === "dark" ? "header-ghost-dark" : "header-ghost-light");
  }
}

export function BrandScrollSnap() {
  const pathname = usePathname();

  useEffect(() => {
    document.documentElement.classList.add("snap-scroll");
    document.body.classList.add("snap-scroll-page");
    const unlockSnapVh = lockSnapViewportHeight();

    const hero = document.getElementById("brand-hero");
    const header = document.getElementById("site-header");
    if (!hero || !header) {
      return () => {
        unlockSnapVh();
        document.documentElement.classList.remove("snap-scroll");
        document.body.classList.remove("snap-scroll-page");
        resetSnapScroll();
      };
    }

    const heroTheme =
      hero.dataset.heroTheme === "dark" ? "dark" : "light";
    const hasVideoHero = hero.classList.contains("brand-hero-video");

    const headerHeight = header.getBoundingClientRect().height;
    const scrollRoot = getSnapScrollRoot();

    const updateHeroState = (heroInView: boolean) => {
      setBrandHeroHeader(heroInView, heroTheme);

      if (hasVideoHero) {
        document.documentElement.classList.toggle(
          "brand-hero-video-active",
          heroInView,
        );
      }
    };

    updateHeroState(true);

    const observer = new IntersectionObserver(
      ([entry]) => {
        const heroInView =
          entry.isIntersecting && entry.intersectionRatio > 0.5;
        updateHeroState(heroInView);
      },
      {
        root: scrollRoot,
        rootMargin: scrollRoot ? "0px" : `-${headerHeight}px 0px 0px 0px`,
        threshold: [0, 0.5, 1],
      },
    );

    observer.observe(hero);

    return () => {
      observer.disconnect();
      unlockSnapVh();
      document.documentElement.classList.remove(
        "snap-scroll",
        "brand-hero-video-active",
      );
      document.body.classList.remove("snap-scroll-page");
      setBrandHeroHeader(false, heroTheme);
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
