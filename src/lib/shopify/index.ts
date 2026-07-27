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

const SHOPIFY_PAGE_SIZE = 100;
/** Revalidate Shopify catalog data every 5 minutes. */
const SHOPIFY_CACHE_REVALIDATE = 300;

export function vendorSearchQuery(brand: string): string {
  const escaped = brand.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
  return `vendor:'${escaped}'`;
}

/** List queries omit descriptionHtml — fill defaults for the Product type. */
function normalizeListProduct(product: Product): Product {
  return {
    ...product,
    description: product.description ?? "",
    descriptionHtml: product.descriptionHtml ?? "",
    images: product.images ?? { nodes: [] },
    variants: product.variants ?? { nodes: [] },
  };
}

function normalizeListProducts(products: Product[]): Product[] {
  return products.map(normalizeListProduct);
}

async function fetchAllProducts({
  sortKey = "CREATED_AT",
  reverse = true,
  query,
  maxWithImages,
  pageSize = SHOPIFY_PAGE_SIZE,
}: GetAllProductsOptions = {}): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];

  const client = getShopifyClient();
  const collected: Product[] = [];
  let after: string | null = null;
  let hasNextPage = true;
  let guard = 0;

  while (hasNextPage && guard < 100) {
    guard += 1;

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
      break;
    }

    const page = response.data?.products;
    if (!page) break;

    collected.push(
      ...productsWithImages(normalizeListProducts(page.nodes)),
    );
    hasNextPage = page.pageInfo.hasNextPage;
    after = page.pageInfo.endCursor;

    if (maxWithImages != null && collected.length >= maxWithImages) {
      return collected.slice(0, maxWithImages);
    }

    if (!hasNextPage || !after) break;
  }

  return collected;
}

/**
 * Cached catalog fetch. Cache key includes sort/query/limits so brand pages
 * and shop-all don't collide. Revalidates every 5 minutes.
 */
const getCachedAllProducts = unstable_cache(
  async (
    sortKey: ProductSortKey,
    reverse: boolean,
    query: string,
    maxWithImages: number,
    pageSize: number,
  ) =>
    fetchAllProducts({
      sortKey,
      reverse,
      query: query || undefined,
      maxWithImages: maxWithImages < 0 ? undefined : maxWithImages,
      pageSize,
    }),
  ["shopify-all-products"],
  {
    revalidate: SHOPIFY_CACHE_REVALIDATE,
    tags: ["products"],
  },
);

/** Fetch every matching product with an image (paginated Storefront requests). */
export async function getAllProducts({
  sortKey = "CREATED_AT",
  reverse = true,
  query,
  maxWithImages,
  pageSize = SHOPIFY_PAGE_SIZE,
}: GetAllProductsOptions = {}): Promise<Product[]> {
  if (!isShopifyConfigured()) return [];

  return getCachedAllProducts(
    sortKey,
    reverse,
    query ?? "",
    maxWithImages ?? -1,
    pageSize,
  );
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

  if (errors) {
    console.error("Shopify getProductByHandle error:", errors);
    return null;
  }

  const product = data?.product ?? null;
  if (!product || !productHasImage(product)) return null;
  return product;
}

const getCachedProductByHandle = unstable_cache(
  async (handle: string) => fetchProductByHandle(handle),
  ["shopify-product-by-handle"],
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
