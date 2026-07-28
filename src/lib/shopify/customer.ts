import { cookies } from "next/headers";
import {
  customerAccountCookies,
  discoverCustomerApiConfig,
  isCustomerAccountConfigured,
  refreshAccessToken,
  type TokenResponse,
} from "./customer-account";
import type { Image, Money } from "./types";

export type CustomerOrderLine = {
  title: string;
  quantity: number;
  image: Image | null;
  productHandle: string | null;
};

export type CustomerOrder = {
  id: string;
  orderNumber: number;
  processedAt: string;
  financialStatus: string | null;
  fulfillmentStatus: string | null;
  statusUrl: string;
  totalPrice: Money;
  lineItems: CustomerOrderLine[];
};

export type Customer = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  numberOfOrders: number;
  orders: CustomerOrder[];
};

const CUSTOMER_QUERY = `
  query CustomerAccount {
    customer {
      id
      firstName
      lastName
      emailAddress {
        emailAddress
      }
      orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          number
          processedAt
          financialStatus
          fulfillmentStatus
          statusPageUrl
          totalPrice {
            amount
            currencyCode
          }
          lineItems(first: 10) {
            nodes {
              title
              quantity
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
      }
    }
  }
`;

type CustomerApiPayload = {
  customer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    emailAddress: { emailAddress: string } | null;
    orders: {
      nodes: Array<{
        id: string;
        number: number;
        processedAt: string;
        financialStatus: string | null;
        fulfillmentStatus: string | null;
        statusPageUrl: string | null;
        totalPrice: Money;
        lineItems: {
          nodes: Array<{
            title: string;
            quantity: number;
            image: Image | null;
          }>;
        };
      }>;
    };
  } | null;
};

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  };
}

export async function persistCustomerTokens(tokens: TokenResponse) {
  const cookieStore = await cookies();
  const maxAge = Math.max(60, tokens.expires_in ?? 3600);

  cookieStore.set(
    customerAccountCookies.access,
    tokens.access_token,
    cookieOptions(maxAge),
  );
  cookieStore.set(
    customerAccountCookies.expires,
    String(Date.now() + maxAge * 1000),
    cookieOptions(maxAge),
  );

  if (tokens.refresh_token) {
    cookieStore.set(
      customerAccountCookies.refresh,
      tokens.refresh_token,
      cookieOptions(60 * 60 * 24 * 30),
    );
  }

  if (tokens.id_token) {
    cookieStore.set(
      customerAccountCookies.idToken,
      tokens.id_token,
      cookieOptions(60 * 60 * 24 * 30),
    );
  }
}

export async function clearCustomerTokens() {
  const cookieStore = await cookies();
  for (const key of Object.values(customerAccountCookies)) {
    cookieStore.delete(key);
  }
}

async function getValidAccessToken(): Promise<string | null> {
  if (!isCustomerAccountConfigured()) return null;

  const cookieStore = await cookies();
  const access = cookieStore.get(customerAccountCookies.access)?.value;
  const expiresAt = Number(
    cookieStore.get(customerAccountCookies.expires)?.value ?? 0,
  );
  const refresh = cookieStore.get(customerAccountCookies.refresh)?.value;

  if (access && Date.now() < expiresAt - 30_000) {
    return access;
  }

  if (!refresh) {
    if (access) await clearCustomerTokens();
    return null;
  }

  const tokens = await refreshAccessToken(refresh);
  if (!tokens?.access_token) {
    await clearCustomerTokens();
    return null;
  }

  await persistCustomerTokens({
    ...tokens,
    refresh_token: tokens.refresh_token ?? refresh,
  });
  return tokens.access_token;
}

function parseCustomer(data: CustomerApiPayload["customer"]): Customer | null {
  if (!data?.id) return null;
  const email = data.emailAddress?.emailAddress;
  if (!email) return null;

  const orders = (data.orders?.nodes ?? []).map((order) => ({
    id: order.id,
    orderNumber: order.number,
    processedAt: order.processedAt,
    financialStatus: order.financialStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    statusUrl: order.statusPageUrl ?? "#",
    totalPrice: order.totalPrice,
    lineItems: (order.lineItems?.nodes ?? []).map((line) => ({
      title: line.title,
      quantity: line.quantity,
      image: line.image,
      productHandle: null,
    })),
  }));

  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email,
    phone: null,
    numberOfOrders: orders.length,
    orders,
  };
}

export async function getCustomer(): Promise<Customer | null> {
  const accessToken = await getValidAccessToken();
  if (!accessToken) return null;

  const api = await discoverCustomerApiConfig();
  if (!api?.graphql_api) return null;

  const response = await fetch(api.graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({ query: CUSTOMER_QUERY }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Customer Account API query failed:", response.status);
    if (response.status === 401) await clearCustomerTokens();
    return null;
  }

  const json = (await response.json()) as {
    data?: CustomerApiPayload;
    errors?: unknown;
  };

  if (json.errors) {
    console.error("Customer Account API GraphQL errors:", json.errors);
  }

  return parseCustomer(json.data?.customer ?? null);
}

export async function logoutCustomer(): Promise<{
  error: string | null;
  logoutUrl: string | null;
}> {
  const cookieStore = await cookies();
  const idToken = cookieStore.get(customerAccountCookies.idToken)?.value ?? null;
  await clearCustomerTokens();

  if (!idToken) return { error: null, logoutUrl: null };

  const { discoverOpenIdConfig, getCustomerAccountLogoutRedirectUrl } =
    await import("./customer-account");
  const config = await discoverOpenIdConfig();
  if (!config?.end_session_endpoint) {
    return { error: null, logoutUrl: null };
  }

  const url = new URL(config.end_session_endpoint);
  url.searchParams.set("id_token_hint", idToken);
  url.searchParams.set(
    "post_logout_redirect_uri",
    getCustomerAccountLogoutRedirectUrl(),
  );

  return { error: null, logoutUrl: url.toString() };
}
