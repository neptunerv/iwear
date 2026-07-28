import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import {
  customerAccountCookies,
  exchangeAuthorizationCode,
  getCustomerAccountCallbackUrl,
} from "@/lib/shopify/customer-account";
import { persistCustomerTokens } from "@/lib/shopify/customer";

function accountUrl(path = "/account") {
  const base = getCustomerAccountCallbackUrl().replace(
    /\/api\/auth\/callback$/,
    "",
  );
  return new URL(path, `${base}/`);
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const error = url.searchParams.get("error");
  if (error) {
    return NextResponse.redirect(
      accountUrl(`/account?error=${encodeURIComponent(error)}`),
    );
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) {
    return NextResponse.redirect(accountUrl("/account?error=missing_code"));
  }

  const cookieStore = await cookies();
  const savedState = cookieStore.get(customerAccountCookies.state)?.value;
  const verifier = cookieStore.get(customerAccountCookies.verifier)?.value;

  cookieStore.delete(customerAccountCookies.state);
  cookieStore.delete(customerAccountCookies.verifier);
  cookieStore.delete(customerAccountCookies.nonce);

  if (!savedState || savedState !== state || !verifier) {
    return NextResponse.redirect(accountUrl("/account?error=invalid_state"));
  }

  const tokens = await exchangeAuthorizationCode({
    code,
    codeVerifier: verifier,
    redirectUri: getCustomerAccountCallbackUrl(),
  });

  if (!tokens?.access_token) {
    return NextResponse.redirect(accountUrl("/account?error=token"));
  }

  await persistCustomerTokens(tokens);
  return NextResponse.redirect(accountUrl("/account"));
}
