"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LabelBar } from "@/components/LabelBar";
import { getSnapScrollRoot } from "@/lib/snap-scroll";

const trustPoints = [
  {
    title: "Authorized reseller",
    body: "Official Luxottica retail partner. Every pair sourced directly — no grey market, no fakes.",
  },
  {
    title: "Official warranty",
    body: "Full manufacturer warranty on every frame, honored in-store and worldwide.",
  },
  {
    title: "Fast Bali delivery",
    body: "Same-day across Kuta and Sanur. Nationwide shipping in 1–3 days.",
  },
  {
    title: "Try before you buy",
    body: "Visit Beachwalk or Sanur to try frames — including brands only available in store.",
  },
] as const;

type TrustPoint = (typeof trustPoints)[number];

type Slide = {
  key: string;
  point: TrustPoint;
  realIndex: number;
  isClone: boolean;
};

function buildSlides(points: readonly TrustPoint[]): Slide[] {
  if (points.length <= 1) {
    return points.map((point, realIndex) => ({
      key: `solo-${point.title}`,
      point,
      realIndex,
      isClone: false,
    }));
  }

  const last = points[points.length - 1];
  const first = points[0];

  return [
    {
      key: `clone-start-${last.title}`,
      point: last,
      realIndex: points.length - 1,
      isClone: true,
    },
    ...points.map((point, realIndex) => ({
      key: `real-${realIndex}-${point.title}`,
      point,
      realIndex,
      isClone: false,
    })),
    {
      key: `clone-end-${first.title}`,
      point: first,
      realIndex: 0,
      isClone: true,
    },
  ];
}

function TrustSlide({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex h-full w-full shrink-0 basis-full flex-col justify-end bg-cream px-8 py-10 sm:px-12 sm:py-14">
      <h2 className="font-poster text-5xl uppercase leading-none sm:text-6xl lg:text-7xl">
        {title}
      </h2>
      <p className="mt-5 max-w-md text-sm font-semibold leading-relaxed text-ink-muted sm:mt-6 sm:text-base">
        {body}
      </p>
    </div>
  );
}

export function TrustSection() {
  const surfaceRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const slides = useMemo(() => buildSlides(trustPoints), []);
  const looping = trustPoints.length > 1;
  const initialPage = looping ? 1 : 0;

  const [page, setPage] = useState(initialPage);
  const [dragX, setDragX] = useState(0);
  const [animate, setAnimate] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const pageRef = useRef(page);
  pageRef.current = page;

  const goToPage = useCallback(
    (nextPage: number, withAnimation: boolean) => {
      const clamped = Math.max(0, Math.min(slides.length - 1, nextPage));
      setAnimate(withAnimation);
      setDragX(0);
      setPage(clamped);
      const slide = slides[clamped];
      if (slide) setActiveIndex(slide.realIndex);
    },
    [slides],
  );

  // After an animated move onto a clone, jump to the matching real slide.
  useEffect(() => {
    if (!looping || draggingRef.current) return;
    const slide = slides[page];
    if (!slide?.isClone) return;

    const realPage =
      page === 0 ? slides.length - 2 : page === slides.length - 1 ? 1 : page;

    const timeout = window.setTimeout(() => {
      setAnimate(false);
      setPage(realPage);
      const real = slides[realPage];
      if (real) setActiveIndex(real.realIndex);
    }, 280);

    return () => window.clearTimeout(timeout);
  }, [looping, page, slides]);

  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface || !looping) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let startMainScroll = 0;
    let startPage = 0;
    let width = 0;
    let lastX = 0;
    let lastT = 0;
    let velocityX = 0;
    let axis: "undecided" | "x" | "y" = "undecided";

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      if ((event.target as HTMLElement | null)?.closest?.("button")) return;

      width = surface.clientWidth;
      if (!width) return;

      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      lastX = event.clientX;
      lastT = performance.now();
      velocityX = 0;
      startPage = pageRef.current;
      startMainScroll = getSnapScrollRoot()?.scrollTop ?? 0;
      axis = "undecided";
      draggingRef.current = true;
      setAnimate(false);
      surface.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;
      const now = performance.now();
      const dt = now - lastT;
      if (dt > 0) {
        velocityX = (event.clientX - lastX) / dt;
        lastX = event.clientX;
        lastT = now;
      }

      if (axis === "undecided") {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
      }

      if (axis === "x") {
        event.preventDefault();
        setDragX(dx);
        return;
      }

      if (axis === "y") {
        const main = getSnapScrollRoot();
        if (!main) return;
        event.preventDefault();
        main.scrollTop = startMainScroll - dy;
      }
    };

    const onUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;
      pointerId = null;
      draggingRef.current = false;

      if (axis === "x") {
        const dx = event.clientX - startX;
        const distanceThreshold = width * 0.2;
        const velocityThreshold = 0.4;
        let target = startPage;

        if (dx <= -distanceThreshold || velocityX <= -velocityThreshold) {
          target = startPage + 1;
        } else if (dx >= distanceThreshold || velocityX >= velocityThreshold) {
          target = startPage - 1;
        }

        goToPage(target, true);
      } else {
        setDragX(0);
      }

      axis = "undecided";
      velocityX = 0;
    };

    surface.addEventListener("pointerdown", onDown);
    surface.addEventListener("pointermove", onMove, { passive: false });
    surface.addEventListener("pointerup", onUp);
    surface.addEventListener("pointercancel", onUp);

    return () => {
      surface.removeEventListener("pointerdown", onDown);
      surface.removeEventListener("pointermove", onMove);
      surface.removeEventListener("pointerup", onUp);
      surface.removeEventListener("pointercancel", onUp);
    };
  }, [goToPage, looping]);

  function goTo(realIndex: number) {
    goToPage(looping ? realIndex + 1 : realIndex, true);
  }

  const trackStyle = {
    transform: `translate3d(calc(${-page * 100}% + ${dragX}px), 0, 0)`,
    transition: animate && dragX === 0 ? "transform 280ms ease-out" : "none",
  } as const;

  return (
    <div
      id="warranty"
      className="snap-section flex h-full max-h-full min-h-full flex-col overflow-hidden bg-cream text-ink md:h-auto md:max-h-none"
    >
      <LabelBar label="Why buy from iWear" />

      {/* Mobile: page-snap carousel — whole panel is the drag surface */}
      <div
        ref={surfaceRef}
        className="relative min-h-0 flex-1 cursor-grab overflow-hidden bg-cream active:cursor-grabbing md:hidden"
        style={{ touchAction: "none" }}
      >
        <div
          ref={trackRef}
          className="absolute inset-0 flex will-change-transform"
          style={trackStyle}
        >
          {slides.map((slide) => (
            <TrustSlide
              key={slide.key}
              title={slide.point.title}
              body={slide.point.body}
            />
          ))}
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
          {trustPoints.map((point, index) => (
            <button
              key={point.title}
              type="button"
              aria-label={`Show ${point.title}`}
              onClick={() => goTo(index)}
              className={`pointer-events-auto h-1.5 w-1.5 rounded-full transition-colors ${
                index === activeIndex ? "bg-ink" : "bg-ink/25"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 2×2 grid */}
      <section className="hidden min-h-0 flex-1 grid-cols-2 grid-rows-2 md:grid">
        {trustPoints.map((point, index) => (
          <div
            key={point.title}
            className={`flex min-h-0 flex-col justify-end px-8 py-12 transition-colors hover:bg-sand-50 sm:px-10 sm:py-14 md:px-12 md:py-16 ${
              index === 0
                ? "border-b-2 border-r-2 border-ink"
                : index === 1
                  ? "border-b-2 border-ink"
                  : index === 2
                    ? "border-r-2 border-ink"
                    : ""
            }`}
          >
            <h2 className="font-poster text-4xl uppercase leading-none sm:text-5xl lg:text-6xl">
              {point.title}
            </h2>
            <p className="mt-4 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
              {point.body}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
