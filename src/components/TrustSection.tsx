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
    <div className="flex h-full min-h-0 w-full min-w-full shrink-0 basis-full flex-col justify-end px-8 py-10 sm:px-12 sm:py-14">
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
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settlingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(() => buildSlides(trustPoints), []);
  const looping = trustPoints.length > 1;

  const jumpToSlide = useCallback((slideIndex: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const width = scroller.clientWidth;
    if (!width) return;

    settlingRef.current = true;
    scroller.scrollTo({
      left: width * slideIndex,
      behavior: "auto",
    });

    window.requestAnimationFrame(() => {
      settlingRef.current = false;
    });
  }, []);

  const settleLoop = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !looping || settlingRef.current) return;

    const width = scroller.clientWidth;
    if (!width) return;

    const index = Math.round(scroller.scrollLeft / width);
    const slide = slides[index];
    if (!slide) return;

    setActiveIndex(slide.realIndex);

    if (index === slides.length - 1) {
      jumpToSlide(1);
      return;
    }

    if (index === 0) {
      jumpToSlide(slides.length - 2);
    }
  }, [jumpToSlide, looping, slides]);

  useEffect(() => {
    if (!looping) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;

    let primed = false;
    const prime = () => {
      if (primed || !scroller.clientWidth) return;
      primed = true;
      jumpToSlide(1);
    };

    prime();
    const observer = new ResizeObserver(prime);
    observer.observe(scroller);
    return () => observer.disconnect();
  }, [jumpToSlide, looping]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !looping) return;

    let timeout: number | undefined;

    const onScroll = () => {
      if (settlingRef.current) return;

      const width = scroller.clientWidth;
      if (!width) return;
      const index = Math.round(scroller.scrollLeft / width);
      const slide = slides[index];
      if (slide) setActiveIndex(slide.realIndex);

      window.clearTimeout(timeout);
      timeout = window.setTimeout(settleLoop, 80);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("scrollend", settleLoop);

    return () => {
      window.clearTimeout(timeout);
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("scrollend", settleLoop);
    };
  }, [looping, settleLoop, slides]);

  // Native horizontal scroll is stolen by the mobile #site-main vertical
  // snap shell. Drive the carousel with pointer capture instead.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !looping) return;

    let pointerId: number | null = null;
    let startX = 0;
    let startY = 0;
    let startScroll = 0;
    let startMainScroll = 0;
    let axis: "undecided" | "x" | "y" = "undecided";

    const onDown = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startY = event.clientY;
      startScroll = scroller.scrollLeft;
      startMainScroll = getSnapScrollRoot()?.scrollTop ?? 0;
      axis = "undecided";
      scroller.setPointerCapture(event.pointerId);
    };

    const onMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;

      const dx = event.clientX - startX;
      const dy = event.clientY - startY;

      if (axis === "undecided") {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        axis = Math.abs(dx) >= Math.abs(dy) ? "x" : "y";
        if (axis === "x") settlingRef.current = true;
      }

      if (axis === "x") {
        event.preventDefault();
        scroller.scrollLeft = startScroll - dx;
        const width = scroller.clientWidth;
        if (width) {
          const index = Math.round(scroller.scrollLeft / width);
          const slide = slides[index];
          if (slide) setActiveIndex(slide.realIndex);
        }
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

      if (axis === "x") {
        const width = scroller.clientWidth;
        if (width) {
          const index = Math.round(scroller.scrollLeft / width);
          scroller.scrollTo({ left: width * index, behavior: "smooth" });
          window.setTimeout(() => {
            settlingRef.current = false;
            settleLoop();
          }, 280);
        } else {
          settlingRef.current = false;
        }
      } else {
        settlingRef.current = false;
      }

      axis = "undecided";
    };

    scroller.addEventListener("pointerdown", onDown);
    scroller.addEventListener("pointermove", onMove, { passive: false });
    scroller.addEventListener("pointerup", onUp);
    scroller.addEventListener("pointercancel", onUp);

    return () => {
      scroller.removeEventListener("pointerdown", onDown);
      scroller.removeEventListener("pointermove", onMove);
      scroller.removeEventListener("pointerup", onUp);
      scroller.removeEventListener("pointercancel", onUp);
    };
  }, [looping, settleLoop, slides]);

  function goTo(realIndex: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const width = scroller.clientWidth;
    if (!width) return;
    scroller.scrollTo({
      left: width * (looping ? realIndex + 1 : realIndex),
      behavior: "smooth",
    });
  }

  return (
    <div
      id="warranty"
      className="snap-section flex h-full max-h-full min-h-full flex-col overflow-hidden bg-cream text-ink md:h-auto md:max-h-none"
    >
      <LabelBar label="Why buy from iWear" />

      {/* Mobile: infinite swipe carousel */}
      <div className="relative min-h-0 flex-1 md:hidden">
        <div
          ref={scrollerRef}
          className="flex h-full w-full cursor-grab overflow-x-auto active:cursor-grabbing [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ touchAction: "none" }}
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
