/**
 * Freeze snap panel height to the initial visual viewport.
 * Mobile Safari changes `dvh` when the URL bar collapses on first scroll,
 * which moves snap targets mid-gesture and causes a pause-then-jump.
 * Only refresh on orientation change — not on chrome show/hide.
 *
 * Ref-counted so page-level + footer snap helpers can share one lock.
 */

let lockCount = 0;
let onOrientationChange: (() => void) | null = null;

export function lockSnapViewportHeight() {
  const root = document.documentElement;

  const apply = () => {
    root.style.setProperty("--snap-vh", `${window.innerHeight}px`);
  };

  if (lockCount === 0) {
    apply();
    onOrientationChange = apply;
    window.addEventListener("orientationchange", apply);
  }
  lockCount += 1;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0 && onOrientationChange) {
      window.removeEventListener("orientationchange", onOrientationChange);
      onOrientationChange = null;
      root.style.removeProperty("--snap-vh");
    }
  };
}
