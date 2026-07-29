import { unstable_cache } from "next/cache";
import {
  productHasImage,
  productsWithImages,
} from "@/lib/product-utils";
import { getShopifyClient, isShopifyConfigured } from "./client";
import {
  GET_COLLECTIONS_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_PRODUCTS_QUERY,
  SEARCH_PRODUCTS_QUERY,
} from "./queries";
import type { Collection, Product } from "./types";

type ProductsPage = {
  products: {
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
    nodes: Product[];
  };
};
type ProductResponse = { product: Product | null };
type CollectionsResponse = { collections: { nodes: Collection[] } };
type CollectionByHandleResponse = {
  collection: {
    id: string;
    handle: string;
    title: string;
    description: string;
    image: Collection["image"];
    products: { nodes: Product[] };
  } | null;
};
type SearchResponse = { search: { nodes: Product[] } };

type ProductSortKey = "CREATED_AT" | "BEST_SELLING";

type GetProductsOptions = {
  first?: number;
  sortKey?: ProductSortKey;
  reverse?: boolean;
  /** Shopify product search query, e.g. `vendor:'Oakley'` */
  query?: string;
};

type GetAllProductsOptions = {
  sortKey?: ProductSortKey;
  reverse?: boolean;
  query?: string;
  /** Stop once this many imaged products are collected. Omit for all. */
  maxWithImages?: number;
  pageSize?: number;
};

const SHOPIFY_PAGE_SIZE = 50;
/** Revalidate Shopify catalog data every 5 minutes. */
const SHOPIFY_CACHE_REVALIDATE = 300;
/**
 * In-process memo for the *assembled* catalog (all pages stitched).
 * Next.js Data Cache cannot store the full list (2MB/entry cap), so we only
 * persist per-page entries there and keep the stitched array in memory briefly.
 * UI: no change. Perf: repeat /shop hits on a warm server skip re-stitching.
 */
const ASSEMBLED_CATALOG_TTL_MS = 60_000;

type AssembledCatalogEntry = {
  expires: number;
  products: Product[];
};

const assembledCatalogCache = new Map<string, AssembledCatalogEntry>();

export function vendorSearchQuery(brand: string): string {
  const escaped = brand.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `vendor:'${escaped}'`;
}

/** List queries omit descriptionHtml — fill defaults for the Product type. */
function normalizeListProduct(product: Product): Product {
  // Keep a short plain-text blurb for lens-type filters; drop the rest so
  // per-page cache entries stay well under Next’s 2MB limit.
  const description = (product.description ?? "").slice(0, 240);

  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    description,
    descriptionHtml: "",
    availableForSale: product.availableForSale,
    vendor: product.vendor,
    tags: product.tags ?? [],
    featuredImage: product.featuredImage
      ? {
          url: product.featuredImage.url,
          altText: product.featuredImage.altText ?? null,
          width: 0,
          height: 0,
        }
      : null,
    images: {
      nodes: (product.images?.nodes ?? []).slice(0, 2).map((image) => ({
        url: image.url,
        altText: image.altText ?? null,
        width: 0,
        height: 0,
      })),
    },
    priceRange: product.priceRange,
    variants: {
      nodes: (product.variants?.nodes ?? []).slice(0, 8).map((variant) => ({
        id: variant.id,
        title: variant.title,
        availableForSale: variant.availableForSale,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice,
        image: null,
        selectedOptions: variant.selectedOptions ?? [],
      })),
    },
    metafields: (product.metafields ?? []).filter(Boolean).map((field) =>
      field
        ? {
            namespace: field.namespace,
            key: field.key,
            value: field.value,
            type: field.type,
          }
        : null,
    ),
  };
}

function normalizeListProducts(products: Product[]): Product[] {
  return products.map(normalizeListProduct);
}

type ProductsPageResult = {
  nodes: Product[];
  hasNextPage: boolean;
  endCursor: string | null;
};

async function fetchProductsPage({
  sortKey = "CREATED_AT",
  reverse = true,
  query,
  after = null,
  pageSize = SHOPIFY_PAGE_SIZE,
}: {
  sortKey?: ProductSortKey;
  reverse?: boolean;
  query?: string;
  after?: string | null;
  pageSize?: number;
}): Promise<ProductsPageResult> {
  if (!isShopifyConfigured()) {
    return { nodes: [], hasNextPage: false, endCursor: null };
  }

  const client = getShopifyClient();
  const response: {
    data?: ProductsPage;
    errors?: unknown;
  } = await client.request(GET_PRODUCTS_QUERY, {
    variables: {
      first: pageSize,
      sortKey,
      reverse,
      query: query || null,
      after,
    },
  });

  if (response.errors) {
    console.error("Shopify getAllProducts error:", response.errors);
    return { nodes: [], hasNextPage: false, endCursor: null };
  }

  const page = response.data?.products;
  if (!page) {
    return { nodes: [], hasNextPage: false, endCursor: null };
  }

  return {
    nodes: productsWithImages(normalizeListProducts(page.nodes)),
    hasNextPage: page.pageInfo.hasNextPage,
    endCursor: page.pageInfo.endCursor,
  };
}

/**
 * Cache one Storefront page at a time.
 *
 * Why: Next.js `unstable_cache` rejects entries over 2MB. The full shop
 * catalog is larger than that, which caused /shop errors and blank grids.
 * Page-sized entries (~50 products) stay under the cap permanently as the
 * catalog grows — we just store more pages, never one giant blob.
 *
 * UI: unchanged (same products/images). Perf: first load fetches/fills pages;
 * later loads read cached pages; warm instances also hit the in-memory stitch.
 */
const getCachedProductsPage = unstable_cache(
  async (
    sortKey: ProductSortKey,
    reverse: boolean,
    query: string,
    after: string,
    pageSize: number,
  ) =>
    fetchProductsPage({
      sortKey,
      reverse,
      query: query || undefined,
      after: after || null,
      pageSize,
    }),
  // Bump key when catalog media changes so stale page caches don't hide new images.
  ["shopify-products-page-v5"],
  {
    revalidate: SHOPIFY_CACHE_REVALIDATE,
    tags: ["products"],
  },
);

function assembledCatalogKey({
  sortKey,
  reverse,
  query,
  maxWithImages,
  pageSize,
}: Required<
  Pick<GetAllProductsOptions, "sortKey" | "reverse" | "pageSize">
> & {
  query: string;
  maxWithImages: number;
}): string {
  return JSON.stringify([
    sortKey,
    reverse,
    query,
    maxWithImages,
    pageSize,
  ]);
}

async function fetchAllProducts({
  sortKey = "CREATED_AT",
  reverse = true,
  query,
  maxWithImages,
  pageSize = SHOPIFY_PAGE_SIZE,
}: GetAllProductsOptions = {}): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];

  const cacheKey = assembledCatalogKey({
    sortKey,
    reverse,
    query: query ?? "",
    maxWithImages: maxWithImages ?? -1,
    pageSize,
  });
  const cached = assembledCatalogCache.get(cacheKey);
  if (cached && cached.expires > Date.now()) {
    return cached.products;
  }

  const collected: Product[] = [];
  let after: string | null = null;
  let hasNextPage = true;
  let guard = 0;

  while (hasNextPage && guard < 200) {
    guard += 1;

    const page = await getCachedProductsPage(
      sortKey,
      reverse,
      query ?? "",
      after ?? "",
      pageSize,
    );

    collected.push(...page.nodes);
    hasNextPage = page.hasNextPage;
    after = page.endCursor;

    if (maxWithImages != null && collected.length >= maxWithImages) {
      const sliced = collected.slice(0, maxWithImages);
      assembledCatalogCache.set(cacheKey, {
        expires: Date.now() + ASSEMBLED_CATALOG_TTL_MS,
        products: sliced,
      });
      return sliced;
    }

    if (!hasNextPage || !after) break;
  }

  assembledCatalogCache.set(cacheKey, {
    expires: Date.now() + ASSEMBLED_CATALOG_TTL_MS,
    products: collected,
  });
  return collected;
}

/** Fetch every matching product with an image (paginated Storefront requests). */
export async function getAllProducts({
  sortKey = "CREATED_AT",
  reverse = true,
  query,
  maxWithImages,
  pageSize = SHOPIFY_PAGE_SIZE,
}: GetAllProductsOptions = {}): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];

  return fetchAllProducts({
    sortKey,
    reverse,
    query,
    maxWithImages,
    pageSize,
  });
}

export async function getProducts({
  first = 12,
  sortKey = "CREATED_AT",
  reverse = true,
  query,
}: GetProductsOptions = {}): Promise<Product[]> {
  return getAllProducts({
    sortKey,
    reverse,
    query,
    maxWithImages: first,
  });
}

export async function getBestSellers(first = 4): Promise<Product[]> {
  return getProducts({
    first,
    sortKey: "BEST_SELLING",
    reverse: false,
  });
}

const getCachedBestSellerHandles = unstable_cache(
  async (first: number) => {
    const products = await fetchAllProducts({
      sortKey: "BEST_SELLING",
      reverse: false,
      maxWithImages: first,
    });
    return products.map((product) => product.handle);
  },
  ["shopify-best-seller-handles"],
  {
    revalidate: SHOPIFY_CACHE_REVALIDATE,
    tags: ["products", "best-sellers"],
  },
);

export async function getBestSellerHandles(first = 100): Promise<string[]> {
  if (!isShopifyConfigured()) return [];
  return getCachedBestSellerHandles(first);
}

export async function getNewProducts(first = 4): Promise<Product[]> {
  return getProducts({
    first,
    sortKey: "CREATED_AT",
    reverse: true,
  });
}

async function fetchProductByHandle(handle: string): Promise<Product | null> {
  if (!isShopifyConfigured()) return null;

  const client = getShopifyClient();
  const { data, errors } = await client.request<ProductResponse>(
    GET_PRODUCT_BY_HANDLE_QUERY,
    { variables: { handle } },
  );

  const product = data?.product ?? null;
  if (errors) {
    // Field-level access denials (e.g. quantityAvailable without inventory
    // scope) still return the product — don't 404 the PDP for those.
    console.error("Shopify getProductByHandle error:", errors);
    if (!product) return null;
  }

  if (!product || !productHasImage(product)) return null;
  return product;
}

const getCachedProductByHandle = unstable_cache(
  async (handle: string) => fetchProductByHandle(handle),
  ["shopify-product-by-handle-v3"],
  {
    revalidate: SHOPIFY_CACHE_REVALIDATE,
    tags: ["products"],
  },
);

export async function getProductByHandle(
  handle: string,
): Promise<Product | null> {
  if (!isShopifyConfigured()) return null;
  return getCachedProductByHandle(handle);
}

async function fetchSearchProducts(
  query: string,
  first: number,
): Promise<Product[]> {
  if (!isShopifyConfigured() || !query.trim()) return [];

  const client = getShopifyClient();
  const { data, errors } = await client.request<SearchResponse>(
    SEARCH_PRODUCTS_QUERY,
    { variables: { query: query.trim(), first: Math.min(first * 3, 100) } },
  );

  if (errors) {
    console.error("Shopify searchProducts error:", errors);
    return [];
  }

  return productsWithImages(
    normalizeListProducts(data?.search.nodes ?? []),
  ).slice(0, first);
}

const getCachedSearchProducts = unstable_cache(
  async (query: string, first: number) => fetchSearchProducts(query, first),
  ["shopify-search-products"],
  {
    revalidate: SHOPIFY_CACHE_REVALIDATE,
    tags: ["products"],
  },
);

export async function searchProducts(
  query: string,
  first = 24,
): Promise<Product[]> {
  if (!isShopifyConfigured() || !query.trim()) return [];
  return getCachedSearchProducts(query.trim(), first);
}

async function fetchCollections(first: number): Promise<Collection[]> {
  if (!isShopifyConfigured()) return [];

  const client = getShopifyClient();
  const { data, errors } = await client.request<CollectionsResponse>(
    GET_COLLECTIONS_QUERY,
    { variables: { first } },
  );

  if (errors) {
    console.error("Shopify getCollections error:", errors);
    return [];
  }

  return data?.collections.nodes ?? [];
}

const getCachedCollections = unstable_cache(
  async (first: number) => fetchCollections(first),
  ["shopify-collections"],
  {
    revalidate: SHOPIFY_CACHE_REVALIDATE,
    tags: ["products", "collections"],
  },
);

export async function getCollections(first = 10): Promise<Collection[]> {
  if (!isShopifyConfigured()) return [];
  return getCachedCollections(first);
}

async function fetchCollectionByHandle(
  handle: string,
  first: number,
): Promise<Collection | null> {
  if (!isShopifyConfigured() || !handle.trim()) return null;

  const client = getShopifyClient();
  const { data, errors } = await client.request<CollectionByHandleResponse>(
    GET_COLLECTION_BY_HANDLE_QUERY,
    {
      variables: {
        handle: handle.trim(),
        first: Math.min(Math.max(first * 3, first), 250),
      },
    },
  );

  if (errors) {
    console.error("Shopify getCollectionByHandle error:", errors);
    return null;
  }

  const collection = data?.collection;
  if (!collection?.id) return null;

  return {
    id: collection.id,
    handle: collection.handle,
    title: collection.title,
    description: collection.description ?? "",
    image: collection.image,
    products: {
      nodes: productsWithImages(
        normalizeListProducts(collection.products.nodes),
      ).slice(0, first),
    },
  };
}

const getCachedCollectionByHandle = unstable_cache(
  async (handle: string, first: number) =>
    fetchCollectionByHandle(handle, first),
  ["shopify-collection-by-handle"],
  {
    revalidate: SHOPIFY_CACHE_REVALIDATE,
    tags: ["products", "collections"],
  },
);

export async function getCollectionByHandle(
  handle: string,
  first = 100,
): Promise<Collection | null> {
  if (!isShopifyConfigured()) return null;
  return getCachedCollectionByHandle(handle, first);
}

export async function getCollectionProductsByHandle(
  handle: string,
  first = 100,
): Promise<Product[]> {
  const collection = await getCollectionByHandle(handle, first);
  return collection?.products.nodes ?? [];
}

export async function getProductsByBrand(
  brand: string,
  maxWithImages?: number,
): Promise<Product[]> {
  return getAllProducts({
    query: vendorSearchQuery(brand),
    maxWithImages,
  });
}

/** Full catalog — every brand, products with images only. */
export async function getShopProducts(maxWithImages?: number): Promise<Product[]> {
  return getAllProducts({ maxWithImages });
}

export { isShopifyConfigured } from "./client";
export type {
  Collection,
  Product,
  ProductVariant,
  Money,
  Image,
  Metafield,
} from "./types";
