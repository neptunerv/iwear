import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BrandEditorialHero } from "@/components/BrandEditorialHero";
import { BrandExploreSection } from "@/components/BrandExploreSection";
import { BrandProductRow } from "@/components/BrandProductRow";
import { Footer } from "@/components/Footer";
import { BrandScrollSnap } from "@/components/BrandScrollSnap";
import { featuredBrands, getBrandPage } from "@/lib/brands";
import { productHasImage } from "@/lib/product-utils";
import {
  getBestSellerHandles,
  getProductsByBrand,
  type Product,
} from "@/lib/shopify";

const brandProductGrid = { columns: 7, rows: 3 } as const;
const brandProductSlotCount = brandProductGrid.columns * brandProductGrid.rows;

function sortByBestSellers(products: Product[], bestSellerHandles: string[]) {
  const rank = new Map(
    bestSellerHandles.map((handle, index) => [handle, index]),
  );

  return [...products].sort((a, b) => {
    const byImage = Number(productHasImage(b)) - Number(productHasImage(a));
    if (byImage !== 0) return byImage;
    const aRank = rank.get(a.handle) ?? Number.POSITIVE_INFINITY;
    const bRank = rank.get(b.handle) ?? Number.POSITIVE_INFINITY;
    return aRank - bRank;
  });
}

type BrandLandingPageProps = {
  params: Promise<{ brand: string }>;
};

export function generateStaticParams() {
  return featuredBrands.map((brand) => ({ brand: brand.slug }));
}

export async function generateMetadata({
  params,
}: BrandLandingPageProps): Promise<Metadata> {
  const { brand: slug } = await params;
  const brand = getBrandPage(slug);

  if (!brand) {
    return { title: "Brand not found" };
  }

  return {
    title: brand.name,
    description: brand.blurb,
  };
}

export default async function BrandLandingPage({ params }: BrandLandingPageProps) {
  const { brand: slug } = await params;
  const brand = getBrandPage(slug);

  if (!brand) {
    notFound();
  }

  const [brandProducts, bestSellerHandles] = await Promise.all([
    getProductsByBrand(brand.name, brandProductSlotCount * 4),
    getBestSellerHandles(100),
  ]);
  // getProductsByBrand returns CREATED_AT desc — newest first.
  const newIn = brandProducts.slice(0, brandProductSlotCount);
  const bestSellers = sortByBestSellers(brandProducts, bestSellerHandles).slice(
    0,
    brandProductSlotCount,
  );

  return (
    <>
      <BrandScrollSnap />

      <BrandEditorialHero
        name={brand.name}
        blurb={brand.blurb}
        shopHref={brand.shopHref}
        videoSrc={brand.heroVideo?.src}
        videoScale={brand.heroVideo?.scale}
      />

      {brand.slug === "ray-ban" || brand.slug === "oakley" ? (
        <BrandExploreSection shopHref={brand.shopHref} />
      ) : null}

      <BrandProductRow
        title="Best sellers"
        viewAllHref={brand.shopHref}
        products={bestSellers}
        slotCount={brandProductSlotCount}
        viewportGrid={brandProductGrid}
      />

      <BrandProductRow
        title="New in"
        viewAllHref={brand.shopHref}
        products={newIn}
        slotCount={brandProductSlotCount}
        viewportGrid={brandProductGrid}
      />

      <Footer viewport snap className="shop-footer" />
    </>
  );
}
