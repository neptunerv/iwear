import type { MetadataRoute } from "next";
import { featuredBrands } from "@/lib/brands";
import { site } from "@/lib/site";
import { getShopProducts } from "@/lib/shopify";

const staticPaths = [
  "/",
  "/shop",
  "/search",
  "/stores",
  "/about",
  "/faq",
  "/account",
  "/shipping",
  "/warranty",
  "/privacy",
  "/terms",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path === "/" ? "" : path}`,
    lastModified: now,
    changeFrequency: path === "/" || path === "/shop" ? "daily" : "weekly",
    priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.6,
  }));

  const brandEntries: MetadataRoute.Sitemap = featuredBrands.flatMap(
    (brand) => [
      {
        url: `${base}${brand.href}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      },
      {
        url: `${base}${brand.shopHref}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.85,
      },
    ],
  );

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const products = await getShopProducts();
    productEntries = products.map((product) => ({
      url: `${base}/products/${product.handle}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
  } catch (error) {
    console.error("Sitemap product fetch failed:", error);
  }

  return [...staticEntries, ...brandEntries, ...productEntries];
}
