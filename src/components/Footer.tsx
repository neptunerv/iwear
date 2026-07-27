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

const cellClass = "flex min-h-0 flex-col bg-brand p-6 sm:p-8 lg:p-10";
const labelClass =
  "font-display text-3xl italic leading-none sm:text-4xl";
const bodyClass = "text-sm font-semibold sm:text-base";
const mutedClass = `${bodyClass} text-ink/80`;

const exploreLinks: FooterNavItem[] = [
  { href: "/account", label: "Account" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: site.instagram, label: "Instagram", external: true },
  { href: site.messageUrl, label: site.whatsappLabel, external: true },
];

const legalLinks: FooterNavItem[] = [
  { href: "/warranty", label: "Warranty" },
  { href: "/shipping", label: "Shipping & returns" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms of use" },
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
          "flex items-center justify-between gap-3 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:bg-ink hover:text-brand sm:px-8 sm:py-4 lg:px-10";

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
  const hourLines = store.hours.split(" · ");

  return (
    <>
      <p className={labelClass}>{store.area}</p>
      <div className="mt-auto pt-8">
        <p className={`leading-relaxed ${mutedClass}`}>{store.mall}</p>
        <p className={`leading-relaxed ${mutedClass}`}>{store.level}</p>
        <p className={`mt-4 leading-relaxed ${mutedClass}`}>{store.street}</p>
        <p className={`leading-relaxed ${mutedClass}`}>{store.cityLine}</p>
        <div className={`mt-4 space-y-1 text-ink/70 ${bodyClass}`}>
          {hourLines.map((line) => (
            <p key={line} className="leading-relaxed">
              {line}
            </p>
          ))}
        </div>
        <a
          href={store.mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex border-2 border-ink px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors hover:bg-ink hover:text-brand sm:text-xs"
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
      {/* Full-bleed rule directly under the title — same for Explore & Legal */}
      <div className="-mx-6 -mb-6 mt-6 flex min-h-0 flex-1 flex-col border-t-2 border-ink sm:-mx-8 sm:-mb-8 sm:mt-8 lg:-mx-10 lg:-mb-10">
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
          ? "min-h-0 flex-1 grid-rows-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:grid-rows-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          : ""
      }`}
    >
      {/* About — tall left tile */}
      <div className={`${cellClass} col-span-2 md:row-span-2`}>
        <p className={labelClass}>About</p>
        <p
          className={`mt-6 max-w-md text-base leading-relaxed sm:text-lg ${mutedClass}`}
        >
          {site.description}
        </p>
      </div>

      <div className={cellClass}>
        <StoreAddress store={kuta} />
      </div>

      <div className={cellClass}>
        <StoreAddress store={sanur} />
      </div>

      <FooterNavCell title="Explore" items={exploreLinks} borderLast />
      <FooterNavCell title="Legal" items={legalLinks} borderLast />

      <div className="col-span-2 bg-brand px-6 py-5 text-xs font-semibold leading-relaxed text-ink/70 sm:px-8 sm:text-sm md:col-span-4 lg:px-10">
        © {new Date().getFullYear()} {site.name} — Authorized Luxottica
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
    const viewportClass = [
      "h-[calc(100dvh-var(--header-h))] max-h-[calc(100dvh-var(--header-h))]",
      snap ? "snap-section snap-section-footer" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <>
        {snap ? <FooterScrollSnap /> : null}

        <footer
          className={`${viewportClass} flex flex-col overflow-hidden border-t-2 border-ink bg-brand text-ink ${className}`.trim()}
        >
          <FooterInfo fill />
        </footer>

        <section
          className={`${viewportClass} flex flex-col bg-brand text-ink ${className}`.trim()}
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
