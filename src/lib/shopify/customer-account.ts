import { createHash, randomBytes } from "crypto";
import { getShopifyStoreDomain } from "@/lib/shopify/urls";
import { site } from "@/lib/site";

const COOKIE_VERIFIER = "iwear_ca_verifier";
const COOKIE_STATE = "iwear_ca_state";
const COOKIE_NONCE = "iwear_ca_nonce";
const COOKIE_ACCESS = "iwear_ca_access";
const COOKIE_REFRESH = "iwear_ca_refresh";
const COOKIE_ID_TOKEN = "iwear_ca_id";
const COOKIE_EXPIRES = "iwear_ca_expires";

export const customerAccountCookies = {
  verifier: COOKIE_VERIFIER,
  state: COOKIE_STATE,
  nonce: COOKIE_NONCE,
  access: COOKIE_ACCESS,
  refresh: COOKIE_REFRESH,
  idToken: COOKIE_ID_TOKEN,
  expires: COOKIE_EXPIRES,
} as const;

export type OpenIdConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  issuer?: string;
};

export type CustomerApiConfig = {
  graphql_api: string;
};

function base64Url(buffer: Buffer) {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function generateCodeVerifier() {
  return base64Url(randomBytes(32));
}

export function generateCodeChallenge(verifier: string) {
  return base64Url(createHash("sha256").update(verifier).digest());
}

export function generateOAuthState() {
  return base64Url(randomBytes(16));
}

export function getCustomerAccountClientId() {
  return process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID?.trim() || null;
}

export function getCustomerAccountClientSecret() {
  return process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_SECRET?.trim() || null;
}

export function getCustomerAccountCallbackUrl() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "");
  return `${base}/api/auth/callback`;
}

export function getCustomerAccountLogoutRedirectUrl() {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "");
  return `${base}/account`;
}

export function isCustomerAccountConfigured() {
  return Boolean(getShopifyStoreDomain() && getCustomerAccountClientId());
}

export async function discoverOpenIdConfig(): Promise<OpenIdConfig | null> {
  const domain = getShopifyStoreDomain();
  if (!domain) return null;

  const response = await fetch(
    `https://${domain}/.well-known/openid-configuration`,
    { next: { revalidate: 3600 } },
  );
  if (!response.ok) {
    console.error("Customer Account OpenID discovery failed:", response.status);
    return null;
  }
  return (await response.json()) as OpenIdConfig;
}

export async function discoverCustomerApiConfig(): Promise<CustomerApiConfig | null> {
  const domain = getShopifyStoreDomain();
  if (!domain) return null;

  const response = await fetch(
    `https://${domain}/.well-known/customer-account-api`,
    { next: { revalidate: 3600 } },
  );
  if (!response.ok) {
    console.error("Customer Account API discovery failed:", response.status);
    return null;
  }
  return (await response.json()) as CustomerApiConfig;
}

export type TokenResponse = {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
  token_type?: string;
};

export async function exchangeAuthorizationCode(input: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<TokenResponse | null> {
  const clientId = getCustomerAccountClientId();
  const config = await discoverOpenIdConfig();
  if (!clientId || !config?.token_endpoint) return null;

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code: input.code,
    redirect_uri: input.redirectUri,
    code_verifier: input.codeVerifier,
  });

  const headers: HeadersInit = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const secret = getCustomerAccountClientSecret();
  if (secret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`;
  }

  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    console.error(
      "Customer Account token exchange failed:",
      response.status,
      await response.text(),
    );
    return null;
  }

  return (await response.json()) as TokenResponse;
}

export async function refreshAccessToken(
  refreshToken: string,
): Promise<TokenResponse | null> {
  const clientId = getCustomerAccountClientId();
  const config = await discoverOpenIdConfig();
  if (!clientId || !config?.token_endpoint) return null;

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: clientId,
    refresh_token: refreshToken,
  });

  const headers: HeadersInit = {
    "Content-Type": "application/x-www-form-urlencoded",
  };

  const secret = getCustomerAccountClientSecret();
  if (secret) {
    headers.Authorization = `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`;
  }

  const response = await fetch(config.token_endpoint, {
    method: "POST",
    headers,
    body,
  });

  if (!response.ok) {
    console.error(
      "Customer Account token refresh failed:",
      response.status,
      await response.text(),
    );
    return null;
  }

  return (await response.json()) as TokenResponse;
}
