import Link from "next/link";
import { FooterScrollSnap } from "@/components/FooterScrollSnap";
import { IwearWordmark } from "@/components/IwearWordmark";
import { site } from "@/lib/site";

type FooterProps = {
  className?: string;
  /** Split into logo viewport + info viewport. */
  viewport?: boolean;
  /**
   * Make both viewport panels scroll-snap targets. Only use on pages that
   * already snap section-by-section (home, brand, stores). Catalog pages
   * must omit this — enabling snap with only footer targets traps scroll
   * and can land the page on the footer.
   */
  snap?: boolean;
};

type StoreLocation = (typeof site.stores)[number];

type FooterNavItem = {
  href: string;
  label: string;
  external?: boolean;
};

const cellClass = "flex min-h-0 flex-col bg-brand p-3 sm:p-8 lg:p-10";
const labelClass =
  "font-display text-lg italic leading-none sm:text-4xl";
const bodyClass = "text-[10px] font-semibold sm:text-base";
const mutedClass = `${bodyClass} text-ink/80`;

const footerAbout = [
  "iWear is a Bali eyewear shop. Browse Ray-Ban, Oakley, Swarovski, and Scuderia Ferrari online, with more brands in store.",
  "Visit Beachwalk Kuta or Icon Mall Sanur to try on frames and get fitted. Free delivery across Bali.",
] as const;

const footerAboutMobile =
  "Bali eyewear shop. Ray-Ban, Oakley & more — online and in store.";

const exploreLinks: FooterNavItem[] = [
  { href: "/account", label: "Account" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: site.instagram, label: "Instagram", external: true },
  { href: site.messageUrl, label: site.whatsappLabel, external: true },
];

const legalLinks: FooterNavItem[] = [
  { href: "/warranty", label: "Warranty" },
  { href: "/shipping", label: "Shipping" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

function FooterNavList({
  items,
  borderLast = false,
}: {
  items: FooterNavItem[];
  /** Draw a rule under the last item (needed when the column is shorter). */
  borderLast?: boolean;
}) {
  return (
    <ul className="divide-y-2 divide-ink">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const className =
          "flex items-center justify-between gap-3 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-brand sm:px-8 sm:py-4 sm:text-xs lg:px-10";

        return (
          <li
            key={item.href}
            className={isLast && borderLast ? "border-b-2 border-ink" : undefined}
          >
            {item.external ? (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            ) : (
              <Link href={item.href} className={className}>
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function StoreAddress({ store }: { store: StoreLocation }) {
  return (
    <>
      <p className={labelClass}>{store.area}</p>
      <div className="mt-auto pt-2 sm:pt-8">
        <p className={`leading-snug ${mutedClass}`}>
          {store.mall} · {store.level}
        </p>
        <p className={`mt-1 font-display italic leading-snug text-ink/70 sm:mt-4 sm:text-lg`}>
          {store.hours}
        </p>
        <a
          href={store.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex w-full items-center justify-center border-2 border-ink px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-brand sm:mt-6 sm:px-4 sm:py-3 sm:text-xs"
        >
          Get directions
        </a>
      </div>
    </>
  );
}

function FooterNavCell({
  title,
  items,
  borderLast = false,
}: {
  title: string;
  items: FooterNavItem[];
  borderLast?: boolean;
}) {
  return (
    <div className={cellClass}>
      <p className={`shrink-0 ${labelClass}`}>{title}</p>
      {/* Full-bleed rules under the title — keep bottom padding so last item
          border doesn't stack with the grid gutter into a double line. */}
      <div className="-mx-3 mt-2 flex min-h-0 flex-1 flex-col border-t-2 border-ink sm:-mx-8 sm:mt-8 lg:-mx-10">
        <FooterNavList items={items} borderLast={borderLast} />
      </div>
    </div>
  );
}

function FooterContent({ fill = false }: { fill?: boolean }) {
  const [kuta, sanur] = site.stores;

  return (
    <div
      className={`grid grid-cols-2 gap-[2px] bg-ink md:grid-cols-4 ${
        fill
          ? // Fit one mobile viewport; desktop keeps two equal body rows.
            "h-full min-h-0 w-full flex-1 grid-rows-[auto_minmax(0,1fr)_minmax(0,1fr)_auto] overflow-hidden md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          : ""
      }`}
    >
      {/* About — tall left tile */}
      <div className={`${cellClass} col-span-2 md:row-span-2`}>
        <p className={labelClass}>About</p>
        <div
          className={`mt-2 max-w-md space-y-2 leading-snug sm:mt-6 sm:max-w-lg sm:space-y-4 sm:leading-relaxed ${mutedClass}`}
        >
          <p className="sm:hidden">{footerAboutMobile}</p>
          <p className="hidden sm:block">{footerAbout[0]}</p>
          <p className="hidden sm:block">{footerAbout[1]}</p>
        </div>
      </div>

      <div className={cellClass}>
        <StoreAddress store={kuta} />
      </div>

      <div className={cellClass}>
        <StoreAddress store={sanur} />
      </div>

      <FooterNavCell title="Explore" items={exploreLinks} borderLast />
      <FooterNavCell title="Legal" items={legalLinks} borderLast />

      <div className="col-span-2 bg-brand px-3 py-2 text-[9px] font-semibold leading-snug text-ink/70 sm:px-8 sm:py-5 sm:text-sm md:col-span-4 lg:px-10">
        © {new Date().getFullYear()} {site.name}. Authorized Luxottica
        reseller. Ray-Ban and Oakley are trademarks of their respective owners.
      </div>
    </div>
  );
}

function FooterMark({ fill = false }: { fill?: boolean }) {
  return (
    <div
      className={
        fill
          ? "flex flex-1 flex-col items-center justify-center px-5 sm:px-8"
          : "flex flex-col items-center justify-center border-t-2 border-ink px-5 py-20 sm:px-8 sm:py-28 lg:py-32"
      }
    >
      <Link href="/" className="block w-[min(92vw,58rem)]">
        <IwearWordmark className="w-full text-ink" aria-hidden />
        <span className="sr-only">{site.name}</span>
      </Link>
    </div>
  );
}

function FooterInfo({ fill = false }: { fill?: boolean }) {
  return <FooterContent fill={fill} />;
}

export function Footer({
  className = "",
  viewport = false,
  snap = false,
}: FooterProps) {
  if (viewport) {
    // Info + wordmark: one scrollport each. Info is overflow-hidden so
    // compact mobile content stays on a single snap page.
    const infoClass = [
      snap
        ? "h-full max-h-full min-h-full overflow-hidden md:h-auto md:max-h-none md:min-h-[calc(var(--snap-vh,100svh)-var(--header-h))]"
        : "min-h-[calc(100svh-var(--header-h))] md:min-h-[calc(var(--snap-vh,100svh)-var(--header-h))]",
      snap ? "snap-section snap-section-footer" : "",
    ]
      .filter(Boolean)
      .join(" ");
    const markClass = [
      snap
        ? "h-full max-h-full min-h-full overflow-hidden md:h-[calc(var(--snap-vh,100svh)-var(--header-h))] md:max-h-[calc(var(--snap-vh,100svh)-var(--header-h))] md:min-h-[calc(var(--snap-vh,100svh)-var(--header-h))]"
        : "min-h-[calc(100svh-var(--header-h))] md:h-[calc(var(--snap-vh,100svh)-var(--header-h))] md:max-h-[calc(var(--snap-vh,100svh)-var(--header-h))] md:min-h-[calc(var(--snap-vh,100svh)-var(--header-h))]",
      snap ? "snap-section snap-section-footer" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <>
        {snap ? <FooterScrollSnap /> : null}

        <footer
          className={`${infoClass} flex flex-col bg-brand text-ink md:border-t-2 md:border-ink ${className}`.trim()}
        >
          <FooterInfo fill />
        </footer>

        <section
          className={`${markClass} flex flex-col overflow-hidden bg-brand text-ink ${className}`.trim()}
          aria-label={site.name}
        >
          <FooterMark fill />
        </section>
      </>
    );
  }

  return (
    <footer
      className={`mt-auto border-t-2 border-ink bg-brand text-ink ${className}`.trim()}
    >
      <FooterInfo />
      <FooterMark />
    </footer>
  );
}
