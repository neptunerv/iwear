export type Money = {
  amount: string;
  currencyCode: string;
};

export type Image = {
  url: string;
  altText: string | null;
  width: number;
  height: number;
};

export type ProductVariant = {
  id: string;
  title: string;
  availableForSale: boolean;
  /** Requires `unauthenticated_read_product_inventory` Storefront scope. */
  quantityAvailable?: number | null;
  price: Money;
  compareAtPrice: Money | null;
  image: Image | null;
  selectedOptions: { name: string; value: string }[];
};

export type Metafield = {
  namespace: string;
  key: string;
  value: string;
  type: string;
} | null;

export type Product = {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml: string;
  availableForSale: boolean;
  vendor: string;
  featuredImage: Image | null;
  images: { nodes: Image[] };
  priceRange: {
    minVariantPrice: Money;
    maxVariantPrice: Money;
  };
  variants: { nodes: ProductVariant[] };
  tags: string[];
  metafields?: Metafield[];
};

export type Collection = {
  id: string;
  handle: string;
  title: string;
  description: string;
  image: Image | null;
  products: { nodes: Product[] };
};
