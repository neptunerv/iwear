export type BrandHeroVideo = {
  src: string;
  scale?: number;
};

export type BrandPage = {
  name: string;
  slug: string;
  href: string;
  shopHref: string;
  blurb: string;
  collectionHandle: string;
  heroVideo?: BrandHeroVideo;
};

const rayBanHeroVideos = {
  "hp-jennie-d-data": {
    src: "/videos/ray-ban/hp-jennie-d-data.mp4",
  },
  "jennie-best-of": {
    src: "/videos/ray-ban/jennie-best-of.mp4",
    scale: 1.45,
  },
} satisfies Record<string, BrandHeroVideo>;

function resolveRayBanHeroVideo(): BrandHeroVideo {
  const key = process.env.NEXT_PUBLIC_RAY_BAN_HERO_VIDEO ?? "hp-jennie-d-data";
  return (
    rayBanHeroVideos[key as keyof typeof rayBanHeroVideos] ??
    rayBanHeroVideos["hp-jennie-d-data"]
  );
}

const oakleyHeroVideos = {
  mbappe: {
    src: "/videos/oakley/mbappe.mp4",
  },
} satisfies Record<string, BrandHeroVideo>;

function resolveOakleyHeroVideo(): BrandHeroVideo {
  const key = process.env.NEXT_PUBLIC_OAKLEY_HERO_VIDEO ?? "mbappe";
  return (
    oakleyHeroVideos[key as keyof typeof oakleyHeroVideos] ??
    oakleyHeroVideos.mbappe
  );
}

/** Brands with dedicated landing pages. */
export const featuredBrandNames = ["Ray-Ban", "Oakley"] as const;

/** Additional brands available to buy online (no dedicated landing page). */
export const onlineShopBrandNames = [
  "Swarovski",
  "Scuderia Ferrari",
] as const;

/** All brands sold online. */
export const onlineBrandNames = [
  ...featuredBrandNames,
  ...onlineShopBrandNames,
] as const;

/**
 * Authorized brands stocked in Bali stores only — not sold online.
 * Order matches the store brand wall.
 */
export const inStoreOnlyBrandNames = [
  "Michael Kors",
  "Prada",
  "Dolce & Gabbana",
  "Emporio Armani",
  "Giorgio Armani",
  "Bvlgari",
  "Versace",
  "Police",
  "Armani Exchange",
  "Tiffany & Co.",
  "Coach",
  "Gucci",
  "Oliver Peoples",
  "Dior",
  "Guess",
  "Marc Jacobs",
  "Levi's",
  "Burberry",
] as const;

/** Every authorized brand across online + stores (for product tagging / detection). */
export const allStoreBrandNames = [
  ...onlineBrandNames,
  ...inStoreOnlyBrandNames,
] as const;

export const featuredBrands: BrandPage[] = [
  {
    name: "Ray-Ban",
    slug: "ray-ban",
    href: "/ray-ban",
    shopHref: "/ray-ban/shop",
    collectionHandle: "ray-ban",
    blurb:
      "Wayfarer, Aviator, Clubmaster — the icons, in stock and ready to wear out of the store.",
    heroVideo: resolveRayBanHeroVideo(),
  },
  {
    name: "Oakley",
    slug: "oakley",
    href: "/oakley",
    shopHref: "/oakley/shop",
    collectionHandle: "oakley",
    blurb:
      "Holbrook, Frogskins and performance Prizm lenses for surf, sport and everything after.",
    heroVideo: resolveOakleyHeroVideo(),
  },
];

export function getBrandPage(slug: string): BrandPage | undefined {
  return featuredBrands.find((brand) => brand.slug === slug);
}

export function isOnlineBrandName(brand: string): boolean {
  return onlineBrandNames.some(
    (name) => name.toLowerCase() === brand.toLowerCase(),
  );
}

export type Brand = {
  name: string;
  href: string;
  className?: string;
};

/** Online shop brands shown in marquees / brand strips (non-featured). */
export const shopBrands: Brand[] = onlineShopBrandNames.map((name) => ({
  name,
  href: `/shop?brand=${encodeURIComponent(name)}`,
}));

export function getOnlineBrandShopHref(name: string): string {
  const featured = featuredBrands.find(
    (brand) => brand.name.toLowerCase() === name.toLowerCase(),
  );
  if (featured) return featured.href;

  const onlineShop = onlineShopBrandNames.find(
    (brand) => brand.toLowerCase() === name.toLowerCase(),
  );
  if (onlineShop) {
    return `/shop?brand=${encodeURIComponent(onlineShop)}`;
  }

  return "/shop";
}
