"use client";

import { Fragment, useEffect, useRef, useState } from "react";

type MarqueeStripProps = {
  items: string[];
};

function MarqueeItems({ items, copy }: { items: string[]; copy: number }) {
  return items.map((item) => (
    <Fragment key={`${copy}-${item}`}>
      <span className="text-sm font-bold uppercase tracking-[0.2em]">
        {item}
      </span>
      <span className="text-brand">✦</span>
    </Fragment>
  ));
}

export function MarqueeStrip({ items }: MarqueeStripProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [loopWidth, setLoopWidth] = useState(0);

  useEffect(() => {
    const node = trackRef.current;
    if (!node) return;

    const updateWidth = () => {
      setLoopWidth(node.scrollWidth / 2);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, [items]);

  const duration = loopWidth > 0 ? loopWidth / 45 : 28;

  return (
    <div className="shrink-0 overflow-hidden border-b-2 border-ink bg-cream py-3">
      <div
        ref={trackRef}
        className="marquee-track flex w-max items-center gap-8 sm:gap-10"
        style={
          loopWidth > 0
            ? {
                ["--marquee-loop" as string]: `${loopWidth}px`,
                ["--marquee-duration" as string]: `${duration}s`,
              }
            : undefined
        }
      >
        <MarqueeItems items={items} copy={0} />
        <span aria-hidden className="contents">
          <MarqueeItems items={items} copy={1} />
        </span>
      </div>
    </div>
  );
}
