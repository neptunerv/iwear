import { getProductDisplayTitle } from "@/lib/product-specs";
import { getProductReviewSummary } from "@/lib/product-reviews";
import { getProductBrand } from "@/lib/product-utils";
import type { Product } from "@/lib/shopify";
import { site } from "@/lib/site";

export function buildProductJsonLd(product: Product) {
  const { name, color, lens } = getProductDisplayTitle(product);
  const brand = getProductBrand(product);
  const image =
    product.featuredImage?.url ?? product.images.nodes[0]?.url ?? undefined;
  const price = product.priceRange.minVariantPrice;
  const reviews = getProductReviewSummary(product);
  const descriptionParts = [color, lens].filter(Boolean);
  const description =
    product.description?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ||
    [name, ...descriptionParts].join(" · ");

  const offers = {
    "@type": "Offer",
    url: `${site.url.replace(/\/$/, "")}/products/${product.handle}`,
    priceCurrency: price.currencyCode,
    price: price.amount,
    availability: product.availableForSale
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
    seller: {
      "@type": "Organization",
      name: site.name,
    },
  };

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image ? [image] : undefined,
    sku: product.handle,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    offers,
    ...(reviews
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviews.ratingValue,
            reviewCount: reviews.reviewCount,
            bestRating: reviews.bestRating,
            worstRating: reviews.worstRating,
          },
        }
      : {}),
  };
}
