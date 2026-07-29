import { getSnapScrollRoot } from "@/lib/snap-scroll";

export type HeaderTheme = "brand" | "brand-flush" | "video" | "ink";

const HEADER_THEME_CLASSES = [
  "header-ghost",
  "header-ghost-dark",
  "header-ghost-light",
  "header-ink",
  "header-brand-flush",
] as const;

/** Red section → red bar. Video → transparent light text. Else → black bar, white text. */
export function setHeaderTheme(theme: HeaderTheme) {
  const header = document.getElementById("site-header");
  if (!header) return;

  header.classList.remove(...HEADER_THEME_CLASSES);

  if (theme === "video") {
    header.classList.add("header-ghost", "header-ghost-dark");
    return;
  }

  if (theme === "ink") {
    header.classList.add("header-ink");
    return;
  }

  // Only the landing / stores #hero: red bar with no bottom hairline.
  if (theme === "brand-flush") {
    header.classList.add("header-brand-flush");
  }
  // "brand" = default red bar + border (Visit Us, footer, etc.)
}

/** Strip theme overrides — back to the default red bar + border. */
export function clearHeaderTheme() {
  const header = document.getElementById("site-header");
  if (!header) return;
  header.classList.remove(...HEADER_THEME_CLASSES);
}

export function classifySnapSection(el: Element): HeaderTheme {
  if (
    el.classList.contains("brand-hero-video") ||
    el.getAttribute("data-hero-theme") === "dark"
  ) {
    return "video";
  }

  if (el.classList.contains("bg-brand")) {
    // Home + stores top heroes only — keep the border on later red sections.
    if (el.id === "hero") return "brand-flush";
    return "brand";
  }

  return "ink";
}

function syncBrandVideoActive(theme: HeaderTheme) {
  document.documentElement.classList.toggle(
    "brand-hero-video-active",
    theme === "video",
  );
}

/**
 * Watch snap sections under the header and restyle the nav to match:
 * red / video / black+white.
 */
export function observeSnapHeaderTheme(options?: {
  /** Force a single theme (cream-only pages like About). */
  forceTheme?: HeaderTheme;
}): () => void {
  if (options?.forceTheme) {
    setHeaderTheme(options.forceTheme);
    syncBrandVideoActive(options.forceTheme);
    return () => {
      clearHeaderTheme();
      syncBrandVideoActive("brand");
    };
  }

  const sections = Array.from(
    document.querySelectorAll<HTMLElement>("#site-main > .snap-section"),
  );

  if (!sections.length) {
    clearHeaderTheme();
    syncBrandVideoActive("brand");
    return () => {
      clearHeaderTheme();
      syncBrandVideoActive("brand");
    };
  }

  const header = document.getElementById("site-header");
  const headerHeight = header?.getBoundingClientRect().height ?? 56;
  const scrollRoot = getSnapScrollRoot();
  const ratios = new Map<Element, number>();

  const applyBest = () => {
    let best: Element | null = null;
    let bestRatio = 0;
    for (const section of sections) {
      const ratio = ratios.get(section) ?? 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = section;
      }
    }

    // Fallback: first section that still intersects the top band.
    if (!best || bestRatio === 0) {
      best = sections[0] ?? null;
    }

    if (!best) return;
    const theme = classifySnapSection(best);
    setHeaderTheme(theme);
    syncBrandVideoActive(theme);
  };

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        ratios.set(entry.target, entry.isIntersecting ? entry.intersectionRatio : 0);
      }
      applyBest();
    },
    {
      root: scrollRoot,
      // Score coverage in the upper half of the viewport (below the sticky header).
      rootMargin: scrollRoot
        ? "0px 0px -45% 0px"
        : `-${headerHeight}px 0px -45% 0px`,
      threshold: [0, 0.15, 0.35, 0.55, 0.75, 1],
    },
  );

  for (const section of sections) {
    observer.observe(section);
  }

  // Seed ratios from current layout before the first observer callback.
  for (const section of sections) {
    const rect = section.getBoundingClientRect();
    const rootTop = scrollRoot
      ? scrollRoot.getBoundingClientRect().top
      : headerHeight;
    const rootBottom = scrollRoot
      ? scrollRoot.getBoundingClientRect().top + scrollRoot.clientHeight * 0.55
      : headerHeight + window.innerHeight * 0.55;
    const visible = Math.max(
      0,
      Math.min(rect.bottom, rootBottom) - Math.max(rect.top, rootTop),
    );
    const band = Math.max(1, rootBottom - rootTop);
    ratios.set(section, visible / band);
  }
  applyBest();

  return () => {
    observer.disconnect();
    clearHeaderTheme();
    syncBrandVideoActive("brand");
  };
}
