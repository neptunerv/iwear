import Image from "next/image";
import Link from "next/link";
import { buildShopFilterHref } from "@/lib/catalog-filters";

type GenderLink = {
  id: "man" | "woman";
  label: string;
  imageSrc?: string;
  imageAlt?: string;
};

type BrandExploreSectionProps = {
  shopHref: string;
  genderLinks?: GenderLink[];
};

const defaultGenderLinks: GenderLink[] = [
  { id: "man", label: "Men" },
  { id: "woman", label: "Women" },
];

export function BrandExploreSection({
  shopHref,
  genderLinks = defaultGenderLinks,
}: BrandExploreSectionProps) {
  return (
    <section className="snap-section flex flex-col bg-cream text-ink">
      <div className="grid min-h-0 flex-1 grid-rows-2 border-t-2 border-ink md:grid-cols-2 md:grid-rows-1">
        {genderLinks.map(({ id, label, imageSrc, imageAlt }, index) => (
          <Link
            key={id}
            href={buildShopFilterHref(shopHref, { genders: [id] })}
            className={`group relative flex min-h-0 flex-col justify-end overflow-hidden ${
              index === 0
                ? "border-b-2 border-ink md:border-b-0 md:border-r-2"
                : ""
            }`}
          >
            {imageSrc ? (
              <>
                <Image
                  src={imageSrc}
                  alt={imageAlt ?? label}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  priority={index === 0}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent"
                />
              </>
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-cream transition-colors group-hover:bg-sand-50"
              />
            )}

            <div
              className={`relative z-10 px-8 py-10 sm:px-12 sm:py-14 ${
                imageSrc ? "text-cream" : "text-ink"
              }`}
            >
              <h2 className="font-poster text-[clamp(3.5rem,14vw,7rem)] uppercase leading-none">
                {label}
              </h2>
              <p
                className={`mt-5 text-sm font-bold uppercase tracking-[0.2em] underline underline-offset-4 ${
                  imageSrc
                    ? "decoration-cream/70 group-hover:decoration-cream"
                    : ""
                }`}
              >
                Shop {label.toLowerCase()} →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
