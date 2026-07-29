import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductJsonLd } from "@/components/ProductJsonLd";
import { ProductRelatedRail } from "@/components/ProductRelatedRail";
import { ProductReviews } from "@/components/ProductReviews";
import { featuredBrands } from "@/lib/brands";
import {
  buildModelFamilyShopHref,
  getMoreColorProducts,
  getRelatedSectionLabel,
  getSimilarProducts,
} from "@/lib/product-related";
import { getProductDisplayTitle } from "@/lib/product-specs";
import { getProductBrand } from "@/lib/product-utils";
import { getProductByHandle } from "@/lib/shopify";

function getBrandShopHref(brand: string): string {
  const featured = featuredBrands.find(
    (item) => item.name.toLowerCase() === brand.toLowerCase(),
  );
  return featured?.shopHref ?? "/shop";
}

type ProductPageProps = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return { title: "Product not found" };
  }

  const { name } = getProductDisplayTitle(product);

  return {
    title: name,
    description: product.description || undefined,
    alternates: {
      canonical: `/products/${product.handle}`,
    },
    openGraph: {
      title: name,
      description: product.description || undefined,
      url: `/products/${product.handle}`,
      images: product.featuredImage?.url
        ? [{ url: product.featuredImage.url }]
        : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    notFound();
  }

  const brand = getProductBrand(product);
  const { name } = getProductDisplayTitle(product);
  const brandShopHref = getBrandShopHref(brand);

  const moreColorsResult = await getMoreColorProducts(product, 8);
  const similarResult = await getSimilarProducts(
    product,
    moreColorsResult.products.map((item) => item.handle),
    8,
  );
  const similar = similarResult.products;
  const labels = getRelatedSectionLabel(product, similarResult);

  const viewAllHref =
    moreColorsResult.total > 8 && moreColorsResult.familyKey
      ? buildModelFamilyShopHref(brandShopHref, moreColorsResult.familyKey)
      : null;

  return (
    <>
      <ProductJsonLd product={product} />
      <div>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-ink px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-ink-muted sm:px-5 sm:text-xs"
        >
          <Link href="/shop" className="transition-colors hover:text-ink">
            Shop
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            href={brandShopHref}
            className="text-ink transition-colors hover:text-brand"
          >
            {brand}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="truncate text-ink">{name}</span>
        </nav>

        <ProductDetail product={product} />
        <ProductReviews product={product} />

        {(moreColorsResult.products.length > 0 || similar.length > 0) && (
          <div className="border-t border-ink">
            <ProductRelatedRail
              title={labels.moreColorsTitle}
              products={moreColorsResult.products}
              viewAllHref={viewAllHref}
              isLast={similar.length === 0}
            />
            <ProductRelatedRail
              title={labels.similarTitle}
              products={similar}
              isLast
            />
          </div>
        )}
      </div>

      {/* Same viewport footer as shop — hides the compact layout `site-footer`. */}
      <Footer viewport className="shop-footer" />
    </>
  );
}
