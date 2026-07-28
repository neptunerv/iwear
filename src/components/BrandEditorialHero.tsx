import Link from "next/link";

type BrandEditorialHeroProps = {
  name: string;
  blurb: string;
  shopHref: string;
  videoSrc?: string;
  videoScale?: number;
};

export function BrandEditorialHero({
  name,
  blurb,
  shopHref,
  videoSrc,
  videoScale,
}: BrandEditorialHeroProps) {
  const hasVideo = Boolean(videoSrc);

  return (
    <section
      id="brand-hero"
      data-hero-theme={hasVideo ? "dark" : "light"}
      className={`snap-section relative flex min-h-full flex-col overflow-hidden md:min-h-[calc(var(--snap-vh,100svh)-var(--header-h))] ${
        hasVideo ? "brand-hero-video bg-ink text-cream" : "bg-cream text-ink"
      }`}
    >
      {hasVideo ? (
        <>
          <div className="hero-video-wrap">
            <video
              autoPlay
              muted
              loop
              playsInline
              aria-hidden
              className="hero-video absolute inset-0 h-full w-full object-cover"
              style={
                videoScale
                  ? { transform: `scale(${videoScale})` }
                  : undefined
              }
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          </div>
          <div className="hero-video-scrim" aria-hidden />
        </>
      ) : null}

      <div className="relative z-10 flex flex-1 flex-col justify-between px-8 py-10 sm:px-12 sm:py-14">
        <div className="py-10 sm:py-16">
          <h1 className="font-poster text-[clamp(3.5rem,16vw,9rem)] uppercase leading-[0.9]">
            {name}
          </h1>
          <p
            className={`mt-6 max-w-md text-sm font-semibold leading-relaxed sm:text-base ${
              hasVideo ? "text-cream/85" : "text-ink-muted"
            }`}
          >
            {blurb}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4">
          <Link
            href={shopHref}
            className={`border-2 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
              hasVideo
                ? "border-cream hover:bg-cream hover:text-ink"
                : "border-ink hover:bg-ink hover:text-cream"
            }`}
          >
            Shop {name} →
          </Link>
        </div>
      </div>
    </section>
  );
}
