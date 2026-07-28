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
  const [bar, setBar] = useState(false);
  const [overlay, setOverlay] = useState(false);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function clearPending() {
    if (clearTimer.current) {
      clearTimeout(clearTimer.current);
      clearTimer.current = null;
    }
    if (overlayTimer.current) {
      clearTimeout(overlayTimer.current);
      overlayTimer.current = null;
    }
    setBar(false);
    setOverlay(false);
  }

  useEffect(() => {
    clearPending();
  }, [pathname]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (!isInternalNavClick(event)) return;
      clearPending();
      setBar(true);
      // Only dim the screen if navigation is actually slow (avoids blank
      // cream flash during fast hops / Next.js compile waits).
      overlayTimer.current = setTimeout(() => setOverlay(true), 180);
      clearTimer.current = setTimeout(clearPending, 10000);
    }

    function onPageShow() {
      clearPending();
    }

    document.addEventListener("click", onClick, true);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("pageshow", onPageShow);
      clearPending();
    };
  }, []);

  if (!bar && !overlay) return null;

  return (
    <div
      aria-hidden={!bar}
      aria-busy={bar}
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 overflow-hidden">
        <div
          className={`h-full origin-left bg-brand transition-[transform,opacity] duration-300 ease-out ${
            bar ? "nav-progress-active opacity-100" : "scale-x-0 opacity-0"
          }`}
        />
      </div>

      {overlay ? (
        <div className="absolute inset-0 flex items-center justify-center bg-cream/70 transition-opacity duration-200">
          <span className="page-spinner page-spinner-brand" />
        </div>
      ) : null}
    </div>
  );
}
