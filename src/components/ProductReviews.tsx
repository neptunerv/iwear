import { getProductReviewSummary } from "@/lib/product-reviews";
import type { Product } from "@/lib/shopify";

type ProductReviewsProps = {
  product: Product;
};

export function ProductReviews({ product }: ProductReviewsProps) {
  const summary = getProductReviewSummary(product);
  if (!summary) return null;

  const rounded = Math.round(summary.ratingValue * 10) / 10;

  return (
    <div className="border-t-2 border-ink/15 px-5 py-6 sm:px-8 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-muted">
        Customer reviews
      </p>
      <p className="mt-3 font-poster text-3xl uppercase text-ink">
        {rounded}
        <span className="text-lg text-ink-muted"> / {summary.bestRating}</span>
      </p>
      <p className="mt-1 text-sm font-semibold text-ink-muted">
        Based on {summary.reviewCount}{" "}
        {summary.reviewCount === 1 ? "review" : "reviews"}
      </p>
      <p className="mt-3 text-xs font-semibold text-ink-muted">
        Ratings sync from your Shopify reviews app.
      </p>
    </div>
  );
}
