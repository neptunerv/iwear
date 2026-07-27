import { getProductDisplayTitle } from "@/lib/product-specs";
import {
  VARIANT_SUFFIXES,
  formatModelLabel,
  getModelFamilyKey,
  getProductModelTag,
  getProductShapeLabel,
  productInModelFamily,
} from "@/lib/product-model-family";
import { getProductBrand, productsWithImages } from "@/lib/product-utils";
import {
  getAllProducts,
  vendorSearchQuery,
  type Product,
} from "@/lib/shopify";

export {
  buildModelFamilyShopHref,
  formatModelLabel,
  getModelFamilyKey,
  getProductModelTag,
  getProductShapeLabel,
  isSameModelFamily,
  productInModelFamily,
} from "@/lib/product-model-family";

function tagSearchQuery(tag: string): string {
  const escaped = tag.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `tag:'${escaped}'`;
}

/**
 * Shopify sometimes has multiple SKUs that look identical to customers
 * (same frame color + same lens + same photo). Keep one per colorway —
 * Matte Black / Prizm Black vs Matte Black / Prizm Road stay distinct.
 */
function dedupeVisualColorways(products: Product[]): Product[] {
  const seen = new Set<string>();
  const unique: Product[] = [];

  for (const item of products) {
    const imageKey = (item.featuredImage?.url ?? item.images.nodes[0]?.url ?? "")
      .split("?")[0]
      .toLowerCase();
    const { color, lens } = getProductDisplayTitle(item);
    const colorwayKey = [color, lens].filter(Boolean).join(" · ").toLowerCase();
    const key = colorwayKey || imageKey || item.handle.toLowerCase();

    // Same photo alone is not enough to collapse — lens can differ.
    const dedupeKey = colorwayKey ? `${colorwayKey}::${imageKey}` : key;

    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    unique.push(item);
  }

  return unique;
}

export type MoreColorProductsResult = {
  products: Product[];
  /** Unique other colorways in the family (before the rail cap). */
  total: number;
  familyKey: string | null;
};

/**
 * More colors = same model family (BMNG + BMNG SQ, HOLBROOK + HOLBROOK LX…),
 * discovered from short variant suffixes — not only exact tags.
 */
export async function getMoreColorProducts(
  product: Product,
  first = 8,
): Promise<MoreColorProductsResult> {
  const modelTag = getProductModelTag(product);
  if (!modelTag) {
    return { products: [], total: 0, familyKey: null };
  }

  const familyKey = getModelFamilyKey(modelTag);
  const brand = getProductBrand(product);

  const suffixTags = [...VARIANT_SUFFIXES].map(
    (suffix) => `${familyKey} ${suffix.toUpperCase()}`,
  );
  const tagQueries = [tagSearchQuery(familyKey), ...suffixTags.map(tagSearchQuery)];

  const query = `${vendorSearchQuery(brand)} AND (${tagQueries.join(" OR ")})`;
  const products = await getAllProducts({
    query,
    maxWithImages: 64,
  });

  const all = dedupeVisualColorways(
    productsWithImages(products)
      .filter((item) => item.handle !== product.handle)
      .filter((item) => productInModelFamily(item, modelTag)),
  );

  return {
    products: all.slice(0, first),
    total: all.length,
    familyKey,
  };
}

export type SimilarProductsResult = {
  products: Product[];
  /** Shape the results actually matched on, or null if we fell back to brand-only. */
  matchedShape: string | null;
  /** True once we had to widen the shape search beyond the product's own brand. */
  crossBrand: boolean;
};

/**
 * Picks the "other model families" first, padding with same-family items
 * only if there aren't enough — same rule used at every fallback tier below.
 */
function pickOtherFamiliesFirst(
  candidates: Product[],
  modelTag: string | null,
  first: number,
): Product[] {
  const otherFamilies = candidates.filter((item) => {
    if (!modelTag) return true;
    return !productInModelFamily(item, modelTag);
  });

  if (otherFamilies.length >= first) return otherFamilies.slice(0, first);

  const filler = candidates.filter(
    (item) => !otherFamilies.some((other) => other.handle === item.handle),
  );

  return [...otherFamilies, ...filler].slice(0, first);
}

/**
 * Similar = same brand + same shape, normally. But some shapes (e.g. a
 * sport model's "Irregular" cut) belong to only one model within a brand —
 * once its own colorways are excluded (they're already in "More colors"),
 * that search comes up empty. Rather than hiding the section, widen the
 * net: same shape across any brand, then same brand regardless of shape.
 */
export async function getSimilarProducts(
  product: Product,
  excludeHandles: string[] = [],
  first = 8,
): Promise<SimilarProductsResult> {
  const brand = getProductBrand(product);
  const shape = getProductShapeLabel(product);
  const modelTag = getProductModelTag(product);
  const excluded = new Set([product.handle, ...excludeHandles]);

  async function search(query: string): Promise<Product[]> {
    const products = await getAllProducts({ query, maxWithImages: first + 24 });
    return productsWithImages(products).filter(
      (item) => !excluded.has(item.handle),
    );
  }

  if (shape) {
    const sameBrandShape = await search(
      `${vendorSearchQuery(brand)} AND ${tagSearchQuery(shape)}`,
    );
    const picked = pickOtherFamiliesFirst(sameBrandShape, modelTag, first);
    if (picked.length > 0) {
      return { products: picked, matchedShape: shape, crossBrand: false };
    }

    const anyBrandShape = await search(tagSearchQuery(shape));
    const pickedCrossBrand = pickOtherFamiliesFirst(
      anyBrandShape,
      modelTag,
      first,
    );
    if (pickedCrossBrand.length > 0) {
      return { products: pickedCrossBrand, matchedShape: shape, crossBrand: true };
    }
  }

  const sameBrand = await search(vendorSearchQuery(brand));
  return {
    products: pickOtherFamiliesFirst(sameBrand, modelTag, first),
    matchedShape: null,
    crossBrand: false,
  };
}

export function getRelatedSectionLabel(
  product: Product,
  similar: Pick<SimilarProductsResult, "matchedShape" | "crossBrand">,
): {
  moreColorsTitle: string;
  similarTitle: string;
} {
  const { name } = getProductDisplayTitle(product);
  const brand = getProductBrand(product);
  const modelTag = getProductModelTag(product);
  const familyKey = modelTag ? getModelFamilyKey(modelTag) : null;

  const shortName = familyKey ? formatModelLabel(familyKey) : name;

  const { matchedShape, crossBrand } = similar;
  let similarTitle = `More from ${brand}`;
  if (matchedShape) {
    similarTitle = crossBrand
      ? `Similar ${matchedShape} frames`
      : `Similar ${brand} · ${matchedShape}`;
  }

  return {
    moreColorsTitle: `More ${shortName} colors`,
    similarTitle,
  };
}
