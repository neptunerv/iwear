import { cookies } from "next/headers";
import { getShopifyClient, isShopifyConfigured } from "./client";
import {
  CART_CREATE_MUTATION,
  CART_DISCOUNT_CODES_UPDATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
} from "./cart-queries";
import type { Image, Money } from "./types";

const CART_COOKIE = "iwear_cart_id";
const CART_MAX_AGE = 60 * 60 * 24 * 14;

export type CartLine = {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Money;
  };
  merchandise: {
    id: string;
    title: string;
    quantityAvailable?: number | null;
    image: Image | null;
    price: Money;
    product: {
      title: string;
      handle: string;
      featuredImage: Image | null;
    };
  };
};

export type CartDiscountCode = {
  code: string;
  applicable: boolean;
};

export type Cart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  discountCodes: CartDiscountCode[];
  discountAmount: Money | null;
  cost: {
    subtotalAmount: Money;
    totalAmount: Money;
  };
  lines: CartLine[];
};

type CartPayload = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  discountCodes?: CartDiscountCode[] | null;
  discountAllocations?: Array<{
    discountedAmount: Money;
  }> | null;
  cost?: {
    subtotalAmount: Money;
    totalAmount: Money;
  } | null;
  lines?: {
    nodes: Array<{
      id: string;
      quantity: number;
      cost?: { totalAmount: Money } | null;
      merchandise: CartLine["merchandise"] | null;
    }>;
  } | null;
};

type CartDiscountCodesUpdateResponse = {
  cartDiscountCodesUpdate: {
    cart: CartPayload | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

type CartQueryResponse = {
  cart: CartPayload | null;
};

type CartCreateResponse = {
  cartCreate: {
    cart: CartPayload | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

type CartLinesAddResponse = {
  cartLinesAdd: {
    cart: CartPayload | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

type CartLinesUpdateResponse = {
  cartLinesUpdate: {
    cart: CartPayload | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

type CartLinesRemoveResponse = {
  cartLinesRemove: {
    cart: CartPayload | null;
    userErrors: { field: string[] | null; message: string }[];
  };
};

type CartResult = { cart: Cart | null; error: string | null };

async function getCartId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_COOKIE)?.value;
}

async function setCartId(cartId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: CART_MAX_AGE,
    path: "/",
  });
}

async function clearCartId() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_COOKIE);
}

function getUserError(
  errors: { field: string[] | null; message: string }[],
): string | null {
  return errors[0]?.message ?? null;
}

function parseCart(data: CartPayload | null | undefined): Cart | null {
  if (!data?.id || !data.checkoutUrl) return null;

  const zero: Money = { amount: "0", currencyCode: "IDR" };
  const lines = (data.lines?.nodes ?? [])
    .filter(
      (line): line is typeof line & { merchandise: CartLine["merchandise"] } =>
        Boolean(line.merchandise?.id && line.merchandise.product?.handle),
    )
    .map((line) => ({
      id: line.id,
      quantity: line.quantity,
      cost: {
        totalAmount: line.cost?.totalAmount ?? {
          amount: String(
            parseFloat(line.merchandise.price.amount) * line.quantity,
          ),
          currencyCode: line.merchandise.price.currencyCode,
        },
      },
      merchandise: line.merchandise,
    }));

  const discountTotal = (data.discountAllocations ?? []).reduce(
    (sum, allocation) => sum + parseFloat(allocation.discountedAmount.amount),
    0,
  );
  const discountCurrency =
    data.discountAllocations?.[0]?.discountedAmount.currencyCode ??
    data.cost?.subtotalAmount.currencyCode ??
    "IDR";

  return {
    id: data.id,
    checkoutUrl: data.checkoutUrl,
    totalQuantity: data.totalQuantity,
    discountCodes: data.discountCodes ?? [],
    discountAmount:
      discountTotal > 0
        ? { amount: String(discountTotal), currencyCode: discountCurrency }
        : null,
    cost: {
      subtotalAmount: data.cost?.subtotalAmount ?? zero,
      totalAmount: data.cost?.totalAmount ?? zero,
    },
    lines,
  };
}

export async function getCart(): Promise<Cart | null> {
  if (!isShopifyConfigured()) return null;

  const cartId = await getCartId();
  if (!cartId) return null;

  const client = getShopifyClient();
  const { data, errors } = await client.request<CartQueryResponse>(CART_QUERY, {
    variables: { cartId },
  });

  if (errors) {
    console.error("Shopify cart query error:", errors);
    return null;
  }

  const cart = parseCart(data?.cart);
  if (!cart) {
    await clearCartId();
    return null;
  }

  return cart;
}

export async function addToCart(
  variantId: string,
  quantity = 1,
): Promise<CartResult> {
  if (!isShopifyConfigured()) {
    return { cart: null, error: "Shopify is not configured." };
  }

  const client = getShopifyClient();
  const cartId = await getCartId();
  const line = { merchandiseId: variantId, quantity };

  if (cartId) {
    const { data, errors } = await client.request<CartLinesAddResponse>(
      CART_LINES_ADD_MUTATION,
      { variables: { cartId, lines: [line] } },
    );

    if (errors) {
      console.error("Shopify cartLinesAdd error:", errors);
      return { cart: null, error: "Could not update cart." };
    }

    const userError = getUserError(data?.cartLinesAdd.userErrors ?? []);
    if (userError) return { cart: null, error: userError };

    const cart = parseCart(data?.cartLinesAdd.cart);
    if (cart) await setCartId(cart.id);
    return { cart, error: cart ? null : "Could not update cart." };
  }

  const { data, errors } = await client.request<CartCreateResponse>(
    CART_CREATE_MUTATION,
    { variables: { input: { lines: [line] } } },
  );

  if (errors) {
    console.error("Shopify cartCreate error:", errors);
    return { cart: null, error: "Could not create cart." };
  }

  const userError = getUserError(data?.cartCreate.userErrors ?? []);
  if (userError) return { cart: null, error: userError };

  const cart = parseCart(data?.cartCreate.cart);
  if (cart) await setCartId(cart.id);
  return { cart, error: cart ? null : "Could not create cart." };
}

export async function updateCartLine(
  lineId: string,
  quantity: number,
): Promise<CartResult> {
  if (!isShopifyConfigured()) {
    return { cart: null, error: "Shopify is not configured." };
  }

  const cartId = await getCartId();
  if (!cartId) return { cart: null, error: "Cart not found." };

  if (quantity <= 0) {
    return removeCartLines([lineId]);
  }

  const client = getShopifyClient();
  const { data, errors } = await client.request<CartLinesUpdateResponse>(
    CART_LINES_UPDATE_MUTATION,
    { variables: { cartId, lines: [{ id: lineId, quantity }] } },
  );

  if (errors) {
    console.error("Shopify cartLinesUpdate error:", errors);
    return { cart: null, error: "Could not update cart." };
  }

  const userError = getUserError(data?.cartLinesUpdate.userErrors ?? []);
  if (userError) return { cart: null, error: userError };

  const cart = parseCart(data?.cartLinesUpdate.cart);
  if (cart) await setCartId(cart.id);
  return { cart, error: cart ? null : "Could not update cart." };
}

export async function removeCartLines(lineIds: string[]): Promise<CartResult> {
  if (!isShopifyConfigured()) {
    return { cart: null, error: "Shopify is not configured." };
  }

  const cartId = await getCartId();
  if (!cartId) return { cart: null, error: "Cart not found." };

  const client = getShopifyClient();
  const { data, errors } = await client.request<CartLinesRemoveResponse>(
    CART_LINES_REMOVE_MUTATION,
    { variables: { cartId, lineIds } },
  );

  if (errors) {
    console.error("Shopify cartLinesRemove error:", errors);
    return { cart: null, error: "Could not update cart." };
  }

  const userError = getUserError(data?.cartLinesRemove.userErrors ?? []);
  if (userError) return { cart: null, error: userError };

  const cart = parseCart(data?.cartLinesRemove.cart);
  if (cart) await setCartId(cart.id);
  else await clearCartId();
  return { cart, error: null };
}

export async function updateCartDiscountCodes(
  codes: string[],
): Promise<CartResult> {
  if (!isShopifyConfigured()) {
    return { cart: null, error: "Shopify is not configured." };
  }

  const cartId = await getCartId();
  if (!cartId) return { cart: null, error: "Cart not found." };

  const normalized = codes
    .map((code) => code.trim())
    .filter(Boolean);

  const client = getShopifyClient();
  const { data, errors } = await client.request<CartDiscountCodesUpdateResponse>(
    CART_DISCOUNT_CODES_UPDATE_MUTATION,
    { variables: { cartId, discountCodes: normalized } },
  );

  if (errors) {
    console.error("Shopify cartDiscountCodesUpdate error:", errors);
    return { cart: null, error: "Could not update discount code." };
  }

  const userError = getUserError(
    data?.cartDiscountCodesUpdate.userErrors ?? [],
  );
  if (userError) return { cart: null, error: userError };

  const cart = parseCart(data?.cartDiscountCodesUpdate.cart);
  if (!cart) return { cart: null, error: "Could not update discount code." };

  const inapplicable = cart.discountCodes.find((code) => !code.applicable);
  if (normalized.length > 0 && inapplicable) {
    return {
      cart,
      error: `Code “${inapplicable.code}” isn’t applicable to this bag.`,
    };
  }

  await setCartId(cart.id);
  return { cart, error: null };
}
