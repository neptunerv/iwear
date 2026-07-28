"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

function isInternalNavClick(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return false;
  }

  const target = event.target;
  if (!(target instanceof Element)) return false;

  const anchor = target.closest("a");
  if (!(anchor instanceof HTMLAnchorElement)) return false;
  if (anchor.target && anchor.target !== "_self") return false;
  if (anchor.hasAttribute("download")) return false;

  const href = anchor.getAttribute("href");
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  ) {
    return false;
  }

  try {
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return false;
    if (
      url.pathname === window.location.pathname &&
      url.search === window.location.search
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [active, setActive] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setActive(false);
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isInternalNavClick(event)) return;
      if (clearTimer.current) clearTimeout(clearTimer.current);
      setActive(true);
      // Safety: don't leave the overlay stuck if navigation is cancelled.
      clearTimer.current = setTimeout(() => setActive(false), 8000);
    }

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  return (
    <div
      aria-hidden={!active}
      aria-busy={active}
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      {/* Left-to-right bar — fixed to viewport so it shows on ghost/brand headers */}
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        <div
          className={`h-full origin-left bg-brand transition-[transform,opacity] duration-300 ease-out ${
            active ? "nav-progress-active opacity-100" : "scale-x-0 opacity-0"
          }`}
        />
      </div>

      <div
        className={`absolute inset-0 flex items-center justify-center bg-ink/40 transition-opacity duration-200 ${
          active ? "opacity-100" : "opacity-0"
        }`}
      >
        <span
          className={`page-spinner page-spinner-on-dark ${active ? "" : "invisible"}`}
        />
      </div>
    </div>
  );
}
