import { normalizeWhatsAppUrl } from "@/lib/whatsapp";

const whatsappUrl = normalizeWhatsAppUrl(process.env.NEXT_PUBLIC_WHATSAPP_URL);

export const site = {
  name: "iWear Sunglasses",
  shortName: "iWear",
  tagline: "Eyewear in Bali",
  description:
    "Bali eyewear shop. Shop Ray-Ban, Oakley, Swarovski and Scuderia Ferrari online — more brands in store.",
  location: "Bali, Indonesia",
  /**
   * Set NEXT_PUBLIC_WHATSAPP_URL to a real wa.me link (e.g. https://wa.me/62…).
   * When unset, messaging CTAs fall back to Instagram.
   */
  whatsapp: whatsappUrl,
  whatsappLabel: whatsappUrl ? "WhatsApp" : "Message us",
  /** Primary messaging URL — WhatsApp when configured, otherwise Instagram DM. */
  messageUrl: whatsappUrl || "https://ig.me/m/iwear_sunglasses",
  instagram: "https://www.instagram.com/iwear_sunglasses/",
  email: "hello@iwear.id",
  stores: [
    {
      slug: "beachwalk",
      name: "Beachwalk",
      headline: "Beachwalk",
      area: "Kuta",
      mall: "Beachwalk Shopping Center",
      level: "2nd Floor",
      street: "Jl. Pantai Kuta",
      cityLine: "Kuta, Bali 80361",
      hours: "Daily 10:00 – 22:00 · Weekends until 23:00",
      address:
        "Beachwalk Shopping Center, 2nd Floor, Jl. Pantai Kuta, Kuta, Bali 80361, Indonesia",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=iwear+sunglasses+beachwalk+kuta+bali",
    },
    {
      slug: "sanur",
      name: "Sanur",
      headline: "Icon Mall",
      area: "Sanur",
      mall: "Icon Bali Mall",
      level: "4th Floor",
      street: "Jl. Danau Tamblingan No.27",
      cityLine: "Denpasar, Bali 80228",
      hours: "Daily 10:00 – 22:00",
      address:
        "Icon Bali Mall, 4th Floor, Jl. Danau Tamblingan No.27, Denpasar, Bali 80228, Indonesia",
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=iwear+sunglasses+sanur+icon+bali+mall",
    },
  ],
  /** Brands available to buy online. */
  brands: ["Ray-Ban", "Oakley", "Swarovski", "Scuderia Ferrari"] as const,
  /** Authorized brands stocked in Bali stores only. */
  inStoreBrands: [
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
  ] as const,
  inStoreBrandLogos: [
    { name: "Michael Kors", src: "/images/brands/michael-kors.svg" },
    { name: "Prada", src: "/images/brands/prada.svg" },
    { name: "Dolce & Gabbana", src: "/images/brands/dolce.svg" },
    { name: "Emporio Armani", src: "/images/brands/emporio-armani.svg" },
    { name: "Giorgio Armani", src: "/images/brands/giorgio-armani.png" },
    { name: "Bvlgari", src: "/images/brands/bvlgari.svg" },
    { name: "Versace", src: "/images/brands/versace.png" },
    { name: "Police", src: "/images/brands/police.svg" },
    { name: "Armani Exchange", src: "/images/brands/armani-exchange.svg" },
    { name: "Tiffany & Co.", src: "/images/brands/tiffany.svg" },
    { name: "Coach", src: "/images/brands/coach.svg" },
    { name: "Gucci", src: "/images/brands/gucci.svg" },
    { name: "Oliver Peoples", src: "/images/brands/oliver-peoples.svg" },
    { name: "Dior", src: "/images/brands/dior.svg" },
    { name: "Guess", src: "/images/brands/guess.svg" },
    { name: "Marc Jacobs", src: "/images/brands/marc-jacobs.svg" },
    { name: "Levi's", src: "/images/brands/levis.svg" },
    { name: "Burberry", src: "/images/brands/burberry.svg" },
  ] as const,
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  currency: "IDR",
  locale: "en-ID",
} as const;

export const primaryStore = site.stores[0];

export function getStoreAnchorId(slug: string) {
  return `store-${slug}`;
}
