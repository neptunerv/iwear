import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  customerAccountCookies,
  discoverOpenIdConfig,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
  getCustomerAccountCallbackUrl,
  getCustomerAccountClientId,
  isCustomerAccountConfigured,
} from "@/lib/shopify/customer-account";
import { site } from "@/lib/site";

function origin() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(/\/$/, "");
}

export async function GET() {
  if (!isCustomerAccountConfigured()) {
    return NextResponse.redirect(`${origin()}/account?error=not_configured`);
  }

  const clientId = getCustomerAccountClientId();
  const config = await discoverOpenIdConfig();
  if (!clientId || !config?.authorization_endpoint) {
    return NextResponse.redirect(`${origin()}/account?error=discovery`);
  }

  const verifier = generateCodeVerifier();
  const challenge = generateCodeChallenge(verifier);
  const state = generateOAuthState();
  const nonce = generateOAuthState();
  const redirectUri = getCustomerAccountCallbackUrl();

  const cookieStore = await cookies();
  const cookieOpts = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  };
  cookieStore.set(customerAccountCookies.verifier, verifier, cookieOpts);
  cookieStore.set(customerAccountCookies.state, state, cookieOpts);
  cookieStore.set(customerAccountCookies.nonce, nonce, cookieOpts);

  const url = new URL(config.authorization_endpoint);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "openid email customer-account-api:full");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");

  return NextResponse.redirect(url.toString());
}
