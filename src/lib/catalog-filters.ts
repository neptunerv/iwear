import {
  getCompareAtPrice,
  getProductBrand,
  productHasImage,
} from "@/lib/product-utils";
import type { Product } from "@/lib/shopify";

/** Optional family matcher injected by callers to avoid import cycles. */
export type ModelFamilyMatcher = (
  product: Product,
  familyKey: string,
) => boolean;

export type SortOption =
  | "newest"
  | "best-sellers"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export type CatalogFilters = {
  brands: string[];
  priceRanges: string[];
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sort: SortOption;
  /** specs.gender metafield values, e.g. "man" | "woman" | "unisex". */
  genders: string[];
  /** Derived from specs.polarized metafield: "polarized" | "standard". */
  lensTypes: string[];
  /** Frame category from tags: "sunglasses" | "optical". */
  frameTypes: string[];
  /** specs.shape metafield values (any brand that has shape data). */
  frameShapes: string[];
  /** Oakley model-family tags, matched loosely (see matchesModelFamilies). */
  modelFamilies: string[];
  /** Bare model family key from PDP View all, e.g. "LATERALIS". */
  family: string | null;
};

export type PriceRangeOption = {
  id: string;
  label: string;
  min: number;
  max: number | null;
};

export const priceRangeOptions: PriceRangeOption[] = [
  { id: "under-2m", label: "Under Rp 2M", min: 0, max: 2_000_000 },
  { id: "2m-5m", label: "Rp 2M – 5M", min: 2_000_000, max: 5_000_000 },
  { id: "5m-10m", label: "Rp 5M – 10M", min: 5_000_000, max: 10_000_000 },
  { id: "over-10m", label: "Over Rp 10M", min: 10_000_000, max: null },
];

export const sortOptions: { id: SortOption; label: string }[] = [
  { id: "newest", label: "Newest" },
  { id: "best-sellers", label: "Best sellers" },
  { id: "price-asc", label: "Lowest price" },
  { id: "price-desc", label: "Highest price" },
  { id: "name-asc", label: "Name · A–Z" },
];

// Static filter options shown regardless of live product data.
// Sourced from the specs.gender metafield ("Man" / "Woman" / "Unisex").
export const genderOptions = [
  { id: "man", label: "Man" },
  { id: "woman", label: "Woman" },
  { id: "unisex", label: "Unisex" },
];

// Polarized from specs.polarized; gradient/mirror derived from lens text
// (description / title parsing) until dedicated Shopify metafields exist.
export const lensTypeOptions = [
  { id: "polarized", label: "Polarized" },
  { id: "gradient", label: "Gradient" },
  { id: "mirror", label: "Mirror" },
  { id: "standard", label: "Standard" },
];

// Sourced from the Shopify "Optical/Rx" tag. Everything else is treated as
// sunglasses (productType is "Sunglasses" for the whole catalog today).
export const frameTypeOptions = [
  { id: "sunglasses", label: "Sunglasses" },
  { id: "optical", label: "Optical / Rx" },
];

// Matches the values actually present in the specs.shape metafield across
// the live catalog (Ray-Ban, Oakley, and others). Wayfarer/Aviator/Clubmaster
// are Ray-Ban *model* names, not shape data.
export const frameShapeOptions = [
  { id: "round", label: "Round" },
  { id: "square", label: "Square" },
  { id: "rectangle", label: "Rectangle" },
  { id: "oval", label: "Oval" },
  { id: "pilot", label: "Pilot" },
  { id: "cat-eye", label: "Cat-Eye" },
  { id: "butterfly", label: "Butterfly" },
  { id: "phantos", label: "Phantos" },
  { id: "pillow", label: "Pillow" },
  { id: "shield", label: "Shield" },
  { id: "irregular", label: "Irregular" },
];

export const oakleyModelOptions = [
  { id: "holbrook", label: "Holbrook" },
  { id: "radar", label: "Radar" },
  { id: "latch", label: "Latch" },
  { id: "frogskins", label: "Frogskins" },
  { id: "encoder", label: "Encoder" },
  { id: "kato", label: "Kato" },
  { id: "actuator", label: "Actuator" },
  { id: "flak", label: "Flak" },
  { id: "hydra", label: "Hydra" },
  { id: "sliver", label: "Sliver" },
  { id: "jawbreaker", label: "Jaw Breaker" },
];

export function buildShopFilterHref(
  baseHref: string,
  filters: Partial<
    Pick<CatalogFilters, "brands" | "genders" | "frameShapes" | "modelFamilies">
  >,
): string {
  const params = new URLSearchParams();

  if (filters.brands?.length === 1) {
    params.set("brand", filters.brands[0]);
  }

  if (filters.genders?.length === 1) {
    params.set("gender", filters.genders[0]);
  }

  if (filters.frameShapes?.length === 1) {
    params.set("frame", filters.frameShapes[0]);
  }

  if (filters.modelFamilies?.length === 1) {
    params.set("model", filters.modelFamilies[0]);
  }

  const query = params.toString();
  return query ? `${baseHref}?${query}` : baseHref;
}

function csvParam(value?: string | string[]): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value.join(",") : value;
  return raw
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** First scalar from a Next searchParam (string | string[] | undefined). */
export function firstSearchParam(
  value?: string | string[],
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function isSortOption(value: string | undefined): value is SortOption {
  return Boolean(value && sortOptions.some((option) => option.id === value));
}

/** Catalog query keys — keep in sync with serializeCatalogSearchParams. */
export type CatalogSearchParams = {
  brand?: string | string[];
  gender?: string | string[];
  frame?: string | string[];
  model?: string | string[];
  family?: string;
  price?: string | string[];
  lens?: string | string[];
  type?: string | string[];
  sort?: string;
  sale?: string;
  stock?: string;
  page?: string;
};

export function parseFiltersFromSearchParams(
  params: CatalogSearchParams,
): Partial<CatalogFilters> {
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const family = typeof params.family === "string" ? params.family : undefined;
  const stock = typeof params.stock === "string" ? params.stock : undefined;
  const sale = typeof params.sale === "string" ? params.sale : undefined;

  return {
    ...(csvParam(params.brand).length ? { brands: csvParam(params.brand) } : {}),
    ...(csvParam(params.gender).length
      ? { genders: csvParam(params.gender) }
      : {}),
    ...(csvParam(params.frame).length
      ? { frameShapes: csvParam(params.frame) }
      : {}),
    ...(csvParam(params.model).length
      ? { modelFamilies: csvParam(params.model) }
      : {}),
    ...(family ? { family } : {}),
    ...(csvParam(params.price).length
      ? { priceRanges: csvParam(params.price) }
      : {}),
    ...(csvParam(params.lens).length
      ? { lensTypes: csvParam(params.lens) }
      : {}),
    ...(csvParam(params.type).length
      ? { frameTypes: csvParam(params.type) }
      : {}),
    ...(isSortOption(sort) ? { sort } : {}),
    // Default: hide sold out. `stock=all` shows everything.
    inStockOnly: stock !== "all",
    onSaleOnly: sale === "1",
  };
}

/** Write filters + page into the shop URL so back/forward keeps them. */
export function serializeCatalogSearchParams(
  filters: CatalogFilters,
  page: number,
  options?: { fixedBrand?: string },
): string {
  const params = new URLSearchParams();

  if (!options?.fixedBrand && filters.brands.length > 0) {
    params.set("brand", filters.brands.join(","));
  }
  if (filters.genders.length > 0) {
    params.set("gender", filters.genders.join(","));
  }
  if (filters.frameShapes.length > 0) {
    params.set("frame", filters.frameShapes.join(","));
  }
  if (filters.modelFamilies.length > 0) {
    params.set("model", filters.modelFamilies.join(","));
  }
  if (filters.family) {
    params.set("family", filters.family);
  }
  if (filters.priceRanges.length > 0) {
    params.set("price", filters.priceRanges.join(","));
  }
  if (filters.lensTypes.length > 0) {
    params.set("lens", filters.lensTypes.join(","));
  }
  if (filters.frameTypes.length > 0) {
    params.set("type", filters.frameTypes.join(","));
  }
  if (filters.sort !== "newest") {
    params.set("sort", filters.sort);
  }
  if (filters.onSaleOnly) {
    params.set("sale", "1");
  }
  if (!filters.inStockOnly) {
    params.set("stock", "all");
  }
  if (page > 1) {
    params.set("page", String(page));
  }

  return params.toString();
}

export function createDefaultFilters(
  overrides: Partial<CatalogFilters> = {},
): CatalogFilters {
  return {
    brands: [],
    priceRanges: [],
    // Hide sold-out by default; uncheck "In stock only" to show them.
    inStockOnly: true,
    onSaleOnly: false,
    sort: "newest",
    genders: [],
    lensTypes: [],
    frameTypes: [],
    frameShapes: [],
    modelFamilies: [],
    family: null,
    ...overrides,
  };
}

export function getAvailableBrands(products: Product[]): string[] {
  const brands = new Set<string>();

  for (const product of products) {
    brands.add(getProductBrand(product));
  }

  return Array.from(brands).sort((a, b) => a.localeCompare(b));
}

function getProductPrice(product: Product): number {
  return parseFloat(product.priceRange.minVariantPrice.amount);
}

function isProductOnSale(product: Product): boolean {
  const compareAt = getCompareAtPrice(product);
  const price = product.priceRange.minVariantPrice;
  return Boolean(
    compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount),
  );
}

function matchesPriceRanges(price: number, selectedRanges: string[]): boolean {
  if (selectedRanges.length === 0) return true;

  return selectedRanges.some((rangeId) => {
    const range = priceRangeOptions.find((option) => option.id === rangeId);
    if (!range) return false;
    if (range.max === null) return price >= range.min;
    return price >= range.min && price < range.max;
  });
}

// Reads a Shopify `list.single_line_text_field` metafield (e.g. specs.gender
// → `["Man"]`) into a lowercased array. Falls back to treating the raw value
// as a single plain string if it isn't JSON (defensive, shouldn't happen).
function getListMetafieldValues(product: Product, key: string): string[] {
  const field = product.metafields?.find((item) => item?.key === key);
  if (!field?.value) return [];

  try {
    const parsed = JSON.parse(field.value) as unknown;
    if (Array.isArray(parsed)) {
      return parsed.map((value) => String(value).toLowerCase());
    }
  } catch {
    // not JSON — fall through
  }

  return [field.value.toLowerCase()];
}

// specs.gender metafield, e.g. `["Man"]` → ["man"]. No tag equivalent exists.
function getProductGenders(product: Product): string[] {
  return getListMetafieldValues(product, "gender");
}

function matchesGenders(product: Product, selected: string[]): boolean {
  if (selected.length === 0) return true;

  const genders = getProductGenders(product);
  // Untagged products still match any gender selection until Shopify data
  // is fully backfilled.
  if (genders.length === 0) return true;

  if (selected.some((value) => genders.includes(value))) return true;

  // Unisex styles appear under both Men and Women.
  const selectingManOrWoman = selected.some(
    (value) => value === "man" || value === "woman",
  );
  return selectingManOrWoman && genders.includes("unisex");
}

// specs.shape metafield, e.g. `["Cat Eye"]` → ["cat-eye"] to match option ids.
function getProductShapeIds(product: Product): string[] {
  return getListMetafieldValues(product, "shape").map((value) =>
    value.replace(/\s+/g, "-"),
  );
}

function isProductPolarized(product: Product): boolean {
  const field = product.metafields?.find((item) => item?.key === "polarized");
  if (field?.value === "true") return true;
  const lensText = getLensSearchText(product);
  return /\b(polarized|pol)\b/i.test(lensText);
}

function getLensSearchText(product: Product): string {
  const lensField = product.metafields?.find((item) => item?.key === "lens_color");
  return [product.title, product.description, lensField?.value ?? ""]
    .join(" ")
    .toLowerCase();
}

function getProductLensStyles(product: Product): Set<string> {
  const styles = new Set<string>();
  const polarized = isProductPolarized(product);
  if (polarized) styles.add("polarized");

  const lensText = getLensSearchText(product);
  if (/\b(gradient|grd|grdl)\b/i.test(lensText) || /gradient/.test(lensText)) {
    styles.add("gradient");
  }
  if (/\b(mirror|mirr)\b/i.test(lensText) || /mirror/.test(lensText)) {
    styles.add("mirror");
  }

  // "Standard" = non-polarized clear/solid lenses without gradient/mirror flags.
  if (!polarized && !styles.has("gradient") && !styles.has("mirror")) {
    styles.add("standard");
  }

  return styles;
}

function matchesLensTypes(product: Product, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const styles = getProductLensStyles(product);
  return selected.some((value) => styles.has(value));
}

/** True when Shopify tags include Optical/Rx (or close variants). */
function isOpticalFrame(product: Product): boolean {
  return product.tags.some((tag) => {
    const normalized = normalizeToken(tag);
    return (
      normalized === "opticalrx" ||
      normalized === "optical" ||
      normalized === "rx" ||
      normalized === "prescription"
    );
  });
}

function matchesFrameTypes(product: Product, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const optical = isOpticalFrame(product);
  return selected.some((value) =>
    value === "optical" ? optical : !optical,
  );
}

// Oakley model tags are inconsistently punctuated/spaced in the source data
// ("JAW BREAKER", "EV ZERO PATH", "FLAK 2.0") — compare on a stripped,
// alphanumeric-only form so "jawbreaker"/"evzero"/"flak" still match.
function normalizeToken(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function matchesModelFamilies(product: Product, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const normalizedTags = product.tags.map(normalizeToken);
  return selected.some((modelId) => {
    const target = normalizeToken(modelId);
    return normalizedTags.some((tag) => tag.startsWith(target));
  });
}

export function applyCatalogFilters(
  products: Product[],
  filters: CatalogFilters,
  fixedBrand?: string,
  bestSellerHandles: string[] = [],
  matchesModelFamily?: ModelFamilyMatcher,
): Product[] {
  let result = [...products];

  if (fixedBrand) {
    result = result.filter(
      (product) =>
        getProductBrand(product).toLowerCase() === fixedBrand.toLowerCase(),
    );
  } else if (filters.brands.length > 0) {
    result = result.filter((product) => {
      const productBrand = getProductBrand(product).toLowerCase();
      return filters.brands.some(
        (brand) => brand.toLowerCase() === productBrand,
      );
    });
  }

  if (filters.priceRanges.length > 0) {
    result = result.filter((product) =>
      matchesPriceRanges(getProductPrice(product), filters.priceRanges),
    );
  }

  if (filters.inStockOnly) {
    result = result.filter((product) => product.availableForSale);
  }

  if (filters.onSaleOnly) {
    result = result.filter(isProductOnSale);
  }

  if (filters.genders.length > 0) {
    result = result.filter((product) =>
      matchesGenders(product, filters.genders),
    );
  }

  if (filters.lensTypes.length > 0) {
    result = result.filter((product) =>
      matchesLensTypes(product, filters.lensTypes),
    );
  }

  if (filters.frameTypes.length > 0) {
    result = result.filter((product) =>
      matchesFrameTypes(product, filters.frameTypes),
    );
  }

  if (filters.frameShapes.length > 0) {
    result = result.filter((product) => {
      const shapes = getProductShapeIds(product);
      return filters.frameShapes.some((value) => shapes.includes(value));
    });
  }

  if (filters.modelFamilies.length > 0) {
    result = result.filter((product) =>
      matchesModelFamilies(product, filters.modelFamilies),
    );
  }

  if (filters.family && matchesModelFamily) {
    result = result.filter((product) =>
      matchesModelFamily(product, filters.family!),
    );
  }

  return sortProducts(result, filters.sort, bestSellerHandles);
}

function compareByImageFirst(a: Product, b: Product): number {
  return Number(productHasImage(b)) - Number(productHasImage(a));
}

export function sortProducts(
  products: Product[],
  sort: SortOption,
  bestSellerHandles: string[] = [],
): Product[] {
  const sorted = [...products];

  switch (sort) {
    case "best-sellers": {
      if (bestSellerHandles.length === 0) {
        return sorted.sort(compareByImageFirst);
      }

      const rank = new Map(
        bestSellerHandles.map((handle, index) => [handle, index]),
      );

      return sorted.sort((a, b) => {
        const byImage = compareByImageFirst(a, b);
        if (byImage !== 0) return byImage;
        const aRank = rank.get(a.handle) ?? Number.POSITIVE_INFINITY;
        const bRank = rank.get(b.handle) ?? Number.POSITIVE_INFINITY;
        return aRank - bRank;
      });
    }
    case "price-asc":
      return sorted.sort((a, b) => {
        const byImage = compareByImageFirst(a, b);
        if (byImage !== 0) return byImage;
        return getProductPrice(a) - getProductPrice(b);
      });
    case "price-desc":
      return sorted.sort((a, b) => {
        const byImage = compareByImageFirst(a, b);
        if (byImage !== 0) return byImage;
        return getProductPrice(b) - getProductPrice(a);
      });
    case "name-asc":
      return sorted.sort((a, b) => {
        const byImage = compareByImageFirst(a, b);
        if (byImage !== 0) return byImage;
        return a.title.localeCompare(b.title);
      });
    case "newest":
    default:
      return sorted.sort(compareByImageFirst);
  }
}

export function countActiveFilters(
  filters: CatalogFilters,
  fixedBrand?: string,
): number {
  let count = 0;

  if (!fixedBrand && filters.brands.length > 0) count += 1;
  if (filters.priceRanges.length > 0) count += 1;
  // Default is in-stock only — only count when shopper opts into sold-out too.
  if (!filters.inStockOnly) count += 1;
  if (filters.onSaleOnly) count += 1;
  if (filters.sort !== "newest") count += 1;
  if (filters.genders.length > 0) count += 1;
  if (filters.lensTypes.length > 0) count += 1;
  if (filters.frameTypes.length > 0) count += 1;
  if (filters.frameShapes.length > 0) count += 1;
  if (filters.modelFamilies.length > 0) count += 1;
  if (filters.family) count += 1;

  return count;
}
