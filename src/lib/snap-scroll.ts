/**
 * Mobile snap pages scroll inside <main>, not the document.
 * That keeps iOS/Android browser chrome from collapsing (same idea as
 * Ray-Ban House). Desktop still snaps on the document.
 */

export const SNAP_MOBILE_MAX_WIDTH = "(max-width: 767px)";

export function isMobileSnapShell(): boolean {
  return window.matchMedia(SNAP_MOBILE_MAX_WIDTH).matches;
}

export function getSnapScrollRoot(): HTMLElement | null {
  if (!document.documentElement.classList.contains("snap-scroll")) {
    return null;
  }
  if (!isMobileSnapShell()) return null;
  return document.getElementById("site-main");
}

export function resetSnapScroll() {
  const root = getSnapScrollRoot();
  if (root) {
    root.scrollTop = 0;
    return;
  }
  window.scrollTo(0, 0);
}
