export function getShopifyStoreDomain(): string | null {
  return (
    process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ??
    process.env.SHOPIFY_STORE_DOMAIN ??
    null
  );
}

export function getShopifyNavUrls() {
  return {
    search: "/search",
    wishlist: "/wishlist",
    cart: "/cart",
    account: "/account",
  };
}
