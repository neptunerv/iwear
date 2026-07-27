"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Image as ShopifyImage } from "@/lib/shopify";

type ProductGalleryProps = {
  images: ShopifyImage[];
  title: string;
};

type Slide = {
  key: string;
  image: ShopifyImage;
  realIndex: number;
  isClone: boolean;
};

function buildSlides(images: ShopifyImage[]): Slide[] {
  if (images.length === 0) return [];
  if (images.length === 1) {
    return [
      {
        key: `solo-${images[0].url}`,
        image: images[0],
        realIndex: 0,
        isClone: false,
      },
    ];
  }

  const last = images[images.length - 1];
  const first = images[0];

  return [
    {
      key: `clone-start-${last.url}`,
      image: last,
      realIndex: images.length - 1,
      isClone: true,
    },
    ...images.map((image, realIndex) => ({
      key: `real-${realIndex}-${image.url}`,
      image,
      realIndex,
      isClone: false,
    })),
    {
      key: `clone-end-${first.url}`,
      image: first,
      realIndex: 0,
      isClone: true,
    },
  ];
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settlingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = useMemo(() => buildSlides(images), [images]);
  const looping = images.length > 1;

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

  // Land on the first real slide (index 1 when looping).
  useEffect(() => {
    if (!looping) return;
    jumpToSlide(1);
  }, [images.length, jumpToSlide, looping]);

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

  if (!images.length) {
    return (
      <div className="flex aspect-square items-center justify-center bg-white">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
          No image
        </span>
      </div>
    );
  }

  return (
    <div className="relative aspect-square bg-white">
      <div
        ref={scrollerRef}
        className="flex h-full w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.key}
            data-slide={index}
            className="relative h-full w-full shrink-0 snap-center snap-always"
          >
            <Image
              src={slide.image.url}
              alt={slide.image.altText ?? `${title} ${slide.realIndex + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-6 sm:p-8 lg:p-10"
              priority={slide.realIndex === 0 && !slide.isClone}
              draggable={false}
            />
          </div>
        ))}
      </div>

      {images.length > 1 ? (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center gap-1.5 sm:bottom-5"
          aria-hidden
        >
          {images.map((image, index) => (
            <span
              key={image.url}
              className={`h-2 w-2 rounded-full border border-ink ${
                index === activeIndex ? "bg-ink" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
