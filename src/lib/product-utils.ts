import type { Image, Product } from "@/lib/shopify";
import { getProductOptions, findVariantByOptions } from "@/lib/product-options";
import {
  featuredBrandNames,
  allStoreBrandNames,
  isOnlineBrandName,
} from "@/lib/brands";

const knownBrands = [...allStoreBrandNames];

export function isFeaturedBrand(brand: string): boolean {
  return featuredBrandNames.some(
    (name) => name.toLowerCase() === brand.toLowerCase(),
  );
}

export function isOnlineBrand(brand: string): boolean {
  return isOnlineBrandName(brand);
}

export function excludeFeaturedBrandProducts(products: Product[]): Product[] {
  return products.filter(
    (product) => !isFeaturedBrand(getProductBrand(product)),
  );
}

/** Keep only products from brands sold online. */
export function filterOnlineBrandProducts(products: Product[]): Product[] {
  return products.filter((product) =>
    isOnlineBrand(getProductBrand(product)),
  );
}

/** Hide sold-out styles from merchandising surfaces (home, brand landings). */
export function filterInStockProducts(products: Product[]): Product[] {
  return products.filter((product) => product.availableForSale);
}

export function getProductBrand(product: Product): string {
  if (product.vendor) return product.vendor;

  const fromTag = product.tags.find((tag) =>
    knownBrands.some((brand) => tag.toLowerCase() === brand.toLowerCase()),
  );
  if (fromTag) return fromTag;

  const fromTitle = knownBrands.find((brand) =>
    product.title.toLowerCase().includes(brand.toLowerCase()),
  );
  return fromTitle ?? "iWear";
}

export function getCompareAtPrice(product: Product) {
  return product.variants.nodes.find((v) => v.compareAtPrice)?.compareAtPrice ?? null;
}

export function isProductOnSale(product: Product): boolean {
  const compareAt = getCompareAtPrice(product);
  const price = product.priceRange.minVariantPrice;
  return Boolean(
    compareAt && parseFloat(compareAt.amount) > parseFloat(price.amount),
  );
}

const colorOptionNames = ["color", "colour", "frame color", "lens color"];

function getColorOption(product: Product) {
  return getProductOptions(product.variants.nodes).find((option) =>
    colorOptionNames.includes(option.name.toLowerCase()),
  );
}

export type ProductColorSlide = {
  label: string;
  image: Image | null;
};

export function getProductColorSlides(product: Product): ProductColorSlide[] {
  const variants = product.variants.nodes;
  const colorOption = getColorOption(product);

  if (colorOption) {
    return colorOption.values.map((value) => {
      const variant = findVariantByOptions(variants, {
        [colorOption.name]: value,
      });

      return {
        label: value,
        image: variant?.image ?? product.featuredImage,
      };
    });
  }

  const seen = new Set<string>();
  const variantSlides: ProductColorSlide[] = [];

  for (const variant of variants) {
    if (!variant.image || seen.has(variant.image.url)) continue;
    seen.add(variant.image.url);
    variantSlides.push({ label: variant.title, image: variant.image });
  }

  if (variantSlides.length > 0) return variantSlides;

  if (product.images.nodes.length > 0) {
    return product.images.nodes.map((image, index) => ({
      label: `View ${index + 1}`,
      image,
    }));
  }

  return [{ label: product.title, image: product.featuredImage }];
}

export function getProductColorCount(product: Product): number {
  return getProductColorSlides(product).length;
}

export function productHasImage(product: Product): boolean {
  if (product.featuredImage?.url) return true;
  if (product.images.nodes.some((image) => Boolean(image.url))) return true;
  return product.variants.nodes.some((variant) => Boolean(variant.image?.url));
}

/** Keep only products that have at least one photo. */
export function productsWithImages(products: Product[]): Product[] {
  return products.filter(productHasImage);
}
