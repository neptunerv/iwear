import type { Product } from "@/lib/shopify";

export type ProductReviewSummary = {
  ratingValue: number;
  reviewCount: number;
  bestRating: number;
  worstRating: number;
};

/**
 * Read aggregate ratings from common Shopify review-app metafields
 * (`reviews.rating` + `reviews.rating_count`). Judge.me / Loox / Shopify
 * Product Reviews typically publish these when connected.
 */
export function getProductReviewSummary(
  product: Product,
): ProductReviewSummary | null {
  const metafields = product.metafields ?? [];
  const ratingField = metafields.find(
    (field) => field?.namespace === "reviews" && field.key === "rating",
  );
  const countField = metafields.find(
    (field) => field?.namespace === "reviews" && field.key === "rating_count",
  );

  if (!ratingField?.value || !countField?.value) return null;

  let ratingValue = Number.NaN;
  let bestRating = 5;
  let worstRating = 1;

  try {
    const parsed = JSON.parse(ratingField.value) as {
      value?: string | number;
      scale_max?: string | number;
      scale_min?: string | number;
    };
    ratingValue = Number(parsed.value ?? ratingField.value);
    if (parsed.scale_max != null) bestRating = Number(parsed.scale_max);
    if (parsed.scale_min != null) worstRating = Number(parsed.scale_min);
  } catch {
    ratingValue = Number(ratingField.value);
  }

  const reviewCount = Number(countField.value);

  if (
    !Number.isFinite(ratingValue) ||
    !Number.isFinite(reviewCount) ||
    reviewCount <= 0
  ) {
    return null;
  }

  return {
    ratingValue,
    reviewCount,
    bestRating: Number.isFinite(bestRating) ? bestRating : 5,
    worstRating: Number.isFinite(worstRating) ? worstRating : 1,
  };
}
