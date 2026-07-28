/**
 * Freeze snap panel height to the CSS small viewport (100svh).
 *
 * iOS/Android browser chrome (URL bar) show/hide changes `dvh` and
 * `window.innerHeight`, which resizes snap targets mid-gesture. `svh` is
 * the chrome-visible size and stays stable across that toggle.
 *
 * Only remeasure when the layout width changes (rotation / resize) —
 * never on visualViewport chrome animations.
 *
 * Ref-counted so page-level + footer snap helpers can share one lock.
 */

let lockCount = 0;
let lastLayoutWidth = 0;
let onOrientationChange: (() => void) | null = null;
let onWindowResize: (() => void) | null = null;

function measureSmallViewportHeight(): number {
  const probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText =
    "position:fixed;left:0;top:0;height:100svh;width:0;pointer-events:none;visibility:hidden";
  document.documentElement.appendChild(probe);
  const height = probe.getBoundingClientRect().height;
  probe.remove();

  // Fallback if svh is unsupported or returns 0.
  return height > 0 ? height : window.innerHeight;
}

function applySnapVh() {
  document.documentElement.style.setProperty(
    "--snap-vh",
    `${measureSmallViewportHeight()}px`,
  );
  lastLayoutWidth = window.innerWidth;
}

export function lockSnapViewportHeight() {
  if (lockCount === 0) {
    applySnapVh();

    onOrientationChange = () => {
      // Orientation fires before layout settles — remeasure next frame.
      requestAnimationFrame(applySnapVh);
    };
    onWindowResize = () => {
      if (window.innerWidth === lastLayoutWidth) return;
      applySnapVh();
    };

    window.addEventListener("orientationchange", onOrientationChange);
    window.addEventListener("resize", onWindowResize);
  }
  lockCount += 1;

  return () => {
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      if (onOrientationChange) {
        window.removeEventListener("orientationchange", onOrientationChange);
        onOrientationChange = null;
      }
      if (onWindowResize) {
        window.removeEventListener("resize", onWindowResize);
        onWindowResize = null;
      }
      document.documentElement.style.removeProperty("--snap-vh");
      lastLayoutWidth = 0;
    }
  };
}
