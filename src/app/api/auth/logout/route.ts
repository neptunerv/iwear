import { NextResponse } from "next/server";
import { logoutCustomer } from "@/lib/shopify/customer";
import { getCustomerAccountLogoutRedirectUrl } from "@/lib/shopify/customer-account";

export async function GET() {
  const result = await logoutCustomer();
  if (result.logoutUrl) {
    return NextResponse.redirect(result.logoutUrl);
  }
  return NextResponse.redirect(getCustomerAccountLogoutRedirectUrl());
}
