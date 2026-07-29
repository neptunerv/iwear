import { getStoreAnchorId, site } from "@/lib/site";

type VisitUsSectionProps = {
  /** Home scroll-snap layout. Off on product pages. */
  snap?: boolean;
  borderTop?: boolean;
};

function StorePanel({
  store,
  className = "",
  withAnchor = true,
}: {
  store: (typeof site.stores)[number];
  className?: string;
  withAnchor?: boolean;
}) {
  return (
    <div
      id={withAnchor ? getStoreAnchorId(store.slug) : undefined}
      className={`flex min-h-0 flex-col justify-between px-6 py-8 sm:px-12 sm:py-14 ${className}`}
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-6 text-center sm:py-10">
        <p className="font-display text-5xl italic leading-none sm:text-6xl lg:text-7xl">
          {store.headline}
        </p>
        <p className="font-display mt-3 text-4xl italic leading-none sm:text-5xl lg:text-6xl">
          {store.area}
        </p>
        <p className="mt-8 text-sm font-bold uppercase tracking-[0.18em]">
          {store.mall}
          <br />
          {store.level}
        </p>
        <p className="font-display mt-4 text-xl italic leading-snug text-ink/75 sm:mt-5 sm:text-2xl">
          {store.hours}
        </p>
      </div>

      <a
        href={store.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center justify-center border border-ink px-5 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand md:w-auto md:self-end md:py-3"
      >
        Get directions
      </a>
    </div>
  );
}

export function VisitUsSection({
  snap = true,
  borderTop = true,
}: VisitUsSectionProps) {
  if (!snap) {
    return (
      <section
        id="stores"
        className={`grid grid-rows-2 bg-brand text-ink md:grid-cols-2 md:grid-rows-1 ${
          borderTop ? "border-t border-ink" : ""
        }`}
      >
        {site.stores.map((store, index) => (
          <StorePanel
            key={store.slug}
            store={store}
            className={
              index === 0
                ? "border-b border-ink md:border-b-0 md:border-r"
                : ""
            }
          />
        ))}
      </section>
    );
  }

  return (
    <>
      {/* Mobile: one store per snap page */}
      {site.stores.map((store, index) => (
        <section
          key={store.slug}
          id={index === 0 ? "stores" : undefined}
          className={`snap-section flex flex-col bg-brand text-ink md:hidden ${
            borderTop || index > 0 ? "border-t border-ink" : ""
          }`}
        >
          <StorePanel store={store} className="flex-1" />
        </section>
      ))}

      {/* Desktop: side by side in one snap page */}
      <section
        className={`snap-section hidden bg-brand text-ink md:grid md:grid-cols-2 ${
          borderTop ? "border-t border-ink" : ""
        }`}
      >
        {site.stores.map((store, index) => (
          <StorePanel
            key={store.slug}
            store={store}
            withAnchor={false}
            className={index === 0 ? "md:border-r md:border-ink" : ""}
          />
        ))}
      </section>
    </>
  );
}
