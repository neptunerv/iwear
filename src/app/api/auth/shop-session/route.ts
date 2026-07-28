import { NextResponse, type NextRequest } from "next/server";
import {
  discoverCustomerApiConfig,
  type TokenResponse,
} from "@/lib/shopify/customer-account";
import { persistCustomerTokens } from "@/lib/shopify/customer";

type ShopSessionBody = {
  customerAccessToken?: string;
  customerAccessTokenExpiresAt?: string;
  idToken?: string;
};

async function tokenWorksWithCustomerApi(accessToken: string) {
  const api = await discoverCustomerApiConfig();
  if (!api?.graphql_api) return false;

  const response = await fetch(api.graphql_api, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: accessToken,
    },
    body: JSON.stringify({
      query: `query ShopSessionProbe { customer { id } }`,
    }),
    cache: "no-store",
  });

  if (!response.ok) return false;

  const json = (await response.json()) as {
    data?: { customer?: { id?: string } | null };
    errors?: unknown;
  };

  return Boolean(json.data?.customer?.id) && !json.errors;
}

export async function POST(request: NextRequest) {
  let body: ShopSessionBody;
  try {
    body = (await request.json()) as ShopSessionBody;
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const accessToken = body.customerAccessToken?.trim();
  if (!accessToken) {
    return NextResponse.json({ error: "missing_token" }, { status: 400 });
  }

  const works = await tokenWorksWithCustomerApi(accessToken);
  if (!works) {
    return NextResponse.json({ error: "invalid_token" }, { status: 401 });
  }

  let expiresIn = 3600;
  if (body.customerAccessTokenExpiresAt) {
    const expiresAt = Date.parse(body.customerAccessTokenExpiresAt);
    if (!Number.isNaN(expiresAt)) {
      expiresIn = Math.max(60, Math.floor((expiresAt - Date.now()) / 1000));
    }
  }

  const tokens: TokenResponse = {
    access_token: accessToken,
    expires_in: expiresIn,
    id_token: body.idToken,
  };

  await persistCustomerTokens(tokens);
  return NextResponse.json({ ok: true });
}
