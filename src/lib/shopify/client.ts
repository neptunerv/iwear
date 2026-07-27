import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { storefrontEnabled } from "./config";

function getShopifyConfig() {
  const storeDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const publicAccessToken =
    process.env.SHOPIFY_STOREFRONT_PUBLIC_TOKEN ??
    process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const privateAccessToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;
  const apiVersion =
    process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2026-07";

  // Prefer the public Storefront token (hex). Private/admin-style tokens
  // are only used when no public token is set.
  const accessToken = publicAccessToken ?? privateAccessToken;

  if (!storeDomain || !accessToken) {
    return null;
  }

  return {
    storeDomain,
    accessToken,
    apiVersion,
    usePrivateToken: !publicAccessToken && Boolean(privateAccessToken),
  };
}

export function isShopifyConfigured(): boolean {
  return storefrontEnabled && getShopifyConfig() !== null;
}

export function getShopifyClient() {
  const config = getShopifyConfig();

  if (!config) {
    throw new Error(
      "Shopify is not configured. Set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_PUBLIC_TOKEN in .env.local",
    );
  }

  if (config.usePrivateToken) {
    return createStorefrontApiClient({
      storeDomain: config.storeDomain,
      apiVersion: config.apiVersion,
      privateAccessToken: config.accessToken,
    });
  }

  return createStorefrontApiClient({
    storeDomain: config.storeDomain,
    apiVersion: config.apiVersion,
    publicAccessToken: config.accessToken,
  });
}
