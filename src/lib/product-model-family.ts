import { allStoreBrandNames } from "@/lib/brands";
import type { Product } from "@/lib/shopify";

/** Frame / shape labels to ignore when picking a model tag. */
const FRAME_SHAPE_NAMES = [
  "wayfarer",
  "aviator",
  "clubmaster",
  "round",
  "pilot",
  "rectangle",
  "cat-eye",
  "cat eye",
  "square",
  "irregular",
  "oval",
  "shield",
  "pillow",
  "phantos",
  "butterfly",
];

/**
 * Short trailing tokens that mean "same model, different cut/size"
 * — NOT words like Lite / Hybrid / Range (those are different models).
 */
export const VARIANT_SUFFIXES = new Set([
  "sq",
  "sp",
  "xs",
  "xl",
  "lx",
  "ti",
  "a",
  "r",
  "s",
  "l",
  "se",
  "mix",
]);

const IGNORE_TAGS = new Set(
  [
    ...allStoreBrandNames.map((name) => name.toLowerCase()),
    ...FRAME_SHAPE_NAMES,
    "optical/rx",
    "optical",
    "rx",
    "man",
    "woman",
    "unisex",
    "polarized",
    "ferrari",
  ].map((value) => value.toLowerCase()),
);

function normalizeTag(tag: string): string {
  return tag.replace(/\.$/, "").trim();
}

/** True if `rest` is a short variant marker (SQ, XL, A…) not a new model name. */
function isVariantSuffixToken(token: string): boolean {
  const clean = token.replace(/\.$/, "").toLowerCase();
  if (VARIANT_SUFFIXES.has(clean)) return true;
  return /^[a-z]{0,2}\d{0,2}[a-z]{0,2}$/i.test(clean) && clean.length <= 3;
}

/**
 * Strip one trailing variant suffix: "BMNG SQ" → "BMNG", "HOLBROOK LX" → "HOLBROOK".
 * Leaves "FROGSKINS LITE" alone (Lite is a different model).
 */
export function getModelFamilyKey(modelTag: string): string {
  const normalized = normalizeTag(modelTag);
  const parts = normalized.split(/\s+/);
  if (parts.length < 2) return normalized;

  const last = parts[parts.length - 1];
  if (isVariantSuffixToken(last)) {
    return parts.slice(0, -1).join(" ");
  }

  return normalized;
}

/** Same model family? BMNG ↔ BMNG SQ yes; FROGSKINS ↔ FROGSKINS LITE no. */
export function isSameModelFamily(tagA: string, tagB: string): boolean {
  const a = normalizeTag(tagA);
  const b = normalizeTag(tagB);
  if (a.toLowerCase() === b.toLowerCase()) return true;

  const familyA = getModelFamilyKey(a);
  const familyB = getModelFamilyKey(b);
  if (familyA.toLowerCase() === familyB.toLowerCase()) return true;

  const [shorter, longer] = a.length <= b.length ? [a, b] : [b, a];
  if (!longer.toLowerCase().startsWith(`${shorter.toLowerCase()} `)) {
    return false;
  }
  const rest = longer.slice(shorter.length).trim();
  const tokens = rest.split(/\s+/);
  return tokens.length === 1 && isVariantSuffixToken(tokens[0]);
}

export function formatModelLabel(tag: string): string {
  return tag
    .split(/\s+/)
    .map((part) =>
      part === part.toUpperCase() && part.length > 3
        ? part.charAt(0) + part.slice(1).toLowerCase()
        : part,
    )
    .join(" ");
}

/** Exact model tag, e.g. RAFTER, BMNG SQ, 0101 (Aviator R). */
export function getProductModelTag(product: Product): string | null {
  const candidates = product.tags
    .map(normalizeTag)
    .filter((tag) => !IGNORE_TAGS.has(tag.toLowerCase()));

  if (candidates.length === 0) return null;

  const title = product.title.toLowerCase();
  const fromTitle = candidates.find((tag) =>
    title.includes(tag.toLowerCase()),
  );
  if (fromTitle) return fromTitle;

  return [...candidates].sort((a, b) => b.length - a.length)[0] ?? null;
}

function productModelTags(product: Product): string[] {
  return product.tags
    .map(normalizeTag)
    .filter((tag) => !IGNORE_TAGS.has(tag.toLowerCase()));
}

export function productInModelFamily(
  product: Product,
  modelTag: string,
): boolean {
  return productModelTags(product).some((tag) =>
    isSameModelFamily(tag, modelTag),
  );
}

export function getProductShapeLabel(product: Product): string | null {
  const field = product.metafields?.find((item) => item?.key === "shape");
  if (field?.value) {
    try {
      const parsed = JSON.parse(field.value) as unknown;
      if (Array.isArray(parsed) && parsed[0]) return String(parsed[0]);
    } catch {
      // plain string
    }
    if (field.value.trim()) return field.value.trim();
  }

  const shapeTags = new Set(FRAME_SHAPE_NAMES);
  const fromTag = product.tags.find((tag) =>
    shapeTags.has(tag.toLowerCase()),
  );
  return fromTag ?? null;
}

/** Brand shop deep-link for a model family, e.g. `/oakley/shop?family=LATERALIS`. */
export function buildModelFamilyShopHref(
  shopHref: string,
  familyKey: string,
): string {
  const params = new URLSearchParams({ family: familyKey });
  return `${shopHref}?${params.toString()}`;
}
