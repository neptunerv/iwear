const CATALOG_SLOTS = Array.from({ length: 8 }, (_, index) => index);

function CatalogTileSkeleton() {
  return (
    <article className="flex aspect-square animate-pulse flex-col bg-white">
      <div aria-hidden="true" className="min-h-0 flex-1 bg-ink/5" />
      <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-2.5 sm:px-4">
        <span aria-hidden="true" className="h-3 w-16 bg-ink/10" />
        <div aria-hidden="true" className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-ink/30" />
          <span className="h-2 w-2 rounded-full border border-ink/20" />
          <span className="h-2 w-2 rounded-full border border-ink/20" />
        </div>
        <span
          aria-hidden="true"
          className="h-3 w-5 justify-self-end bg-ink/10"
        />
      </div>
    </article>
  );
}

type PageLoadingProps = {
  variant?: "catalog" | "detail" | "simple";
  title?: string;
  message?: string;
};

export function PageLoading({
  variant = "simple",
  title = "Loading",
  message = "Just a moment…",
}: PageLoadingProps) {
  if (variant === "catalog") {
    return (
      <div
        className="bg-cream"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="grid border-b-2 border-ink text-[10px] font-bold uppercase tracking-[0.16em] sm:grid-cols-[1fr_auto_1fr] sm:text-xs">
          <div className="flex items-center border-b-2 border-ink px-3 py-2.5 sm:border-b-0 sm:px-5">
            <span className="text-ink-muted">Filter</span>
          </div>
          <h1 className="flex items-center justify-center border-b-2 border-ink px-3 py-2.5 text-center sm:border-b-0 sm:px-10">
            {title}
          </h1>
          <div className="flex items-center justify-end px-3 py-2.5 sm:px-5">
            <span className="shrink-0 text-ink-muted">{message}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4">
          {CATALOG_SLOTS.map((slot) => (
            <div key={slot} className="border-b-2 border-r-2 border-ink">
              <CatalogTileSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "detail") {
    return (
      <div
        className="bg-cream"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
        <div className="mx-auto grid min-h-[calc(100dvh-var(--header-h))] w-full max-w-6xl lg:grid-cols-2">
          <div className="animate-pulse border-b-2 border-ink bg-white lg:border-b-0 lg:border-r-2" />
          <div className="flex flex-col justify-center px-6 py-12 sm:px-10">
            <div className="h-3 w-24 animate-pulse bg-ink/10" />
            <div className="mt-4 h-10 w-3/4 animate-pulse bg-ink/10" />
            <div className="mt-6 h-3 w-full animate-pulse bg-ink/10" />
            <div className="mt-2 h-3 w-5/6 animate-pulse bg-ink/10" />
            <div className="mt-10 h-12 w-full max-w-xs animate-pulse border-2 border-ink/15 bg-ink/5" />
            <p className="sr-only">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section
      className="relative flex min-h-[calc(100dvh-var(--header-h))] flex-col items-center justify-center bg-cream px-6 py-16 text-ink"
      aria-busy="true"
      aria-live="polite"
      role="status"
    >
      <p className="text-sm font-bold uppercase tracking-widest text-ink-muted">
        {title}
      </p>
      <h1 className="mt-2 font-display text-5xl italic leading-none text-ink sm:text-6xl">
        One moment
      </h1>
      <p className="mt-4 text-sm font-semibold leading-relaxed text-ink-muted">
        {message}
      </p>
      <div className="mt-10 w-full max-w-md space-y-3" aria-hidden="true">
        <div className="h-3 w-2/3 animate-pulse bg-ink/10" />
        <div className="h-3 w-full animate-pulse bg-ink/10" />
        <div className="h-3 w-5/6 animate-pulse bg-ink/10" />
      </div>
    </section>
  );
}
