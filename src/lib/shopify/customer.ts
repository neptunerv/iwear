import { cookies } from "next/headers";
import { getShopifyClient, isShopifyConfigured } from "./client";
import {
  CUSTOMER_ACCESS_TOKEN_CREATE,
  CUSTOMER_ACCESS_TOKEN_DELETE,
  CUSTOMER_CREATE,
  CUSTOMER_QUERY,
} from "./customer-queries";
import type { Image, Money } from "./types";

const CUSTOMER_COOKIE = "iwear_customer_token";
const CUSTOMER_MAX_AGE = 60 * 60 * 24 * 30;

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

type CustomerUserError = {
  code?: string | null;
  field?: string[] | null;
  message: string;
};

type TokenPayload = {
  accessToken: string;
  expiresAt: string;
};

type CustomerPayload = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  phone: string | null;
  numberOfOrders: number;
  orders?: {
    nodes: Array<{
      id: string;
      orderNumber: number;
      processedAt: string;
      financialStatus: string | null;
      fulfillmentStatus: string | null;
      statusUrl: string;
      totalPrice: Money;
      lineItems: {
        nodes: Array<{
          title: string;
          quantity: number;
          variant: {
            image: Image | null;
            product: { handle: string } | null;
          } | null;
        }>;
      };
    }>;
  } | null;
};

type AuthResult = {
  customer: Customer | null;
  error: string | null;
};

async function getCustomerToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CUSTOMER_COOKIE)?.value;
}

async function setCustomerToken(token: string, expiresAt: string) {
  const cookieStore = await cookies();
  const expires = new Date(expiresAt);
  const maxAge = Number.isNaN(expires.getTime())
    ? CUSTOMER_MAX_AGE
    : Math.max(60, Math.floor((expires.getTime() - Date.now()) / 1000));

  cookieStore.set(CUSTOMER_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge,
    path: "/",
  });
}

async function clearCustomerToken() {
  const cookieStore = await cookies();
  cookieStore.delete(CUSTOMER_COOKIE);
}

function firstCustomerError(errors: CustomerUserError[] | undefined): string | null {
  return errors?.[0]?.message ?? null;
}

function parseCustomer(data: CustomerPayload | null | undefined): Customer | null {
  if (!data?.id || !data.email) return null;

  const orders = (data.orders?.nodes ?? []).map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    processedAt: order.processedAt,
    financialStatus: order.financialStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    statusUrl: order.statusUrl,
    totalPrice: order.totalPrice,
    lineItems: (order.lineItems?.nodes ?? []).map((line) => ({
      title: line.title,
      quantity: line.quantity,
      image: line.variant?.image ?? null,
      productHandle: line.variant?.product?.handle ?? null,
    })),
  }));

  return {
    id: data.id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    numberOfOrders: data.numberOfOrders ?? orders.length,
    orders,
  };
}

export async function getCustomer(): Promise<Customer | null> {
  if (!isShopifyConfigured()) return null;

  const token = await getCustomerToken();
  if (!token) return null;

  const client = getShopifyClient();
  const { data, errors } = await client.request<{ customer: CustomerPayload | null }>(
    CUSTOMER_QUERY,
    { variables: { customerAccessToken: token } },
  );

  if (errors) {
    console.error("Shopify customer query error:", errors);
    return null;
  }

  const customer = parseCustomer(data?.customer);
  if (!customer) {
    await clearCustomerToken();
    return null;
  }

  return customer;
}

export async function loginCustomer(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (!isShopifyConfigured()) {
    return { customer: null, error: "Shopify is not configured." };
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request<{
    customerAccessTokenCreate: {
      customerAccessToken: TokenPayload | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_ACCESS_TOKEN_CREATE, {
    variables: { input: { email, password } },
  });

  if (errors) {
    console.error("Shopify customerAccessTokenCreate error:", errors);
    return { customer: null, error: "Could not log in. Try again." };
  }

  const userError = firstCustomerError(
    data?.customerAccessTokenCreate.customerUserErrors,
  );
  if (userError) return { customer: null, error: userError };

  const token = data?.customerAccessTokenCreate.customerAccessToken;
  if (!token?.accessToken) {
    return { customer: null, error: "Could not log in. Check your email and password." };
  }

  await setCustomerToken(token.accessToken, token.expiresAt);
  const customer = await getCustomer();
  return {
    customer,
    error: customer ? null : "Logged in, but could not load your account.",
  };
}

export async function createCustomer(input: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}): Promise<AuthResult> {
  if (!isShopifyConfigured()) {
    return { customer: null, error: "Shopify is not configured." };
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request<{
    customerCreate: {
      customer: { id: string } | null;
      customerUserErrors: CustomerUserError[];
    };
  }>(CUSTOMER_CREATE, {
    variables: {
      input: {
        email: input.email,
        password: input.password,
        firstName: input.firstName || undefined,
        lastName: input.lastName || undefined,
        acceptsMarketing: false,
      },
    },
  });

  if (errors) {
    console.error("Shopify customerCreate error:", errors);
    return { customer: null, error: "Could not create account. Try again." };
  }

  const userError = firstCustomerError(data?.customerCreate.customerUserErrors);
  if (userError) return { customer: null, error: userError };

  if (!data?.customerCreate.customer?.id) {
    return { customer: null, error: "Could not create account." };
  }

  return loginCustomer(input.email, input.password);
}

export async function logoutCustomer(): Promise<{ error: string | null }> {
  if (!isShopifyConfigured()) {
    await clearCustomerToken();
    return { error: null };
  }

  const token = await getCustomerToken();
  if (token) {
    try {
      const client = getShopifyClient();
      await client.request(CUSTOMER_ACCESS_TOKEN_DELETE, {
        variables: { customerAccessToken: token },
      });
    } catch (error) {
      console.error("Shopify customerAccessTokenDelete error:", error);
    }
  }

  await clearCustomerToken();
  return { error: null };
}

export async function getCustomerAccessToken(): Promise<string | undefined> {
  return getCustomerToken();
}
