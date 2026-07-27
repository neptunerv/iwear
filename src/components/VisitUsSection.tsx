import { getStoreAnchorId, site } from "@/lib/site";

type VisitUsSectionProps = {
  /** Home scroll-snap layout. Off on product pages. */
  snap?: boolean;
  borderTop?: boolean;
};

export function VisitUsSection({
  snap = true,
  borderTop = true,
}: VisitUsSectionProps) {
  return (
    <section
      id="stores"
      className={`${
        snap ? "snap-section" : ""
      } grid bg-brand text-ink md:grid-cols-2 ${
        borderTop ? "border-t-2 border-ink" : ""
      }`}
    >
      {site.stores.map((store, index) => (
        <div
          key={store.slug}
          id={getStoreAnchorId(store.slug)}
          className={`flex min-h-[50vh] flex-col justify-between px-8 py-10 sm:px-12 sm:py-14 md:min-h-0 ${
            index === 0
              ? "border-b-2 border-ink md:border-b-0 md:border-r-2"
              : ""
          }`}
        >
          <div className="flex flex-1 flex-col items-center justify-center py-10 text-center">
            <p className="font-display text-5xl italic leading-none sm:text-6xl lg:text-7xl">
              {store.headline}
            </p>
            <p className="font-display mt-3 text-4xl italic leading-none sm:text-5xl lg:text-6xl">
              {store.area}
            </p>
            <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em]">
              {[store.mall, store.level].join(" · ")}
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink/75 sm:text-xs sm:tracking-[0.12em]">
              {store.hours}
            </p>
          </div>

          <a
            href={store.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="self-end border-2 border-ink px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
          >
            Get directions
          </a>
        </div>
      ))}
    </section>
  );
}
