import type { Metadata } from "next";
import Link from "next/link";
import { AccountAuthForm } from "@/components/AccountAuthForm";
import { AccountDashboard } from "@/components/AccountDashboard";
import { Footer } from "@/components/Footer";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";
import {
  getCustomerAccountClientId,
  isCustomerAccountConfigured,
} from "@/lib/shopify/customer-account";
import { getCustomer } from "@/lib/shopify/customer";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account",
  description: `Log in or create an account at ${site.name}.`,
  alternates: {
    canonical: "/account",
  },
};

type AccountPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const { error } = await searchParams;
  const customer = await getCustomer();
  const configured = isCustomerAccountConfigured();
  const clientId = getCustomerAccountClientId();
  const storefrontOrigin = (process.env.NEXT_PUBLIC_SITE_URL ?? site.url).replace(
    /\/$/,
    "",
  );

  return (
    <>
      <HomeScrollSnap keepHeaderBorder />

      <section
        id="hero"
        className="snap-section relative flex h-[calc(100dvh-var(--header-h))] max-h-[calc(100dvh-var(--header-h))] flex-col overflow-y-auto bg-cream text-ink"
      >
        <div className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-12 sm:py-16">
          <div className="w-full text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-ink-muted">
              Account
            </p>
            <h1 className="mt-2 font-display text-5xl italic leading-none text-ink sm:text-6xl">
              {customer ? "Your account" : "Sign in"}
            </h1>
            <p className="mt-4 text-sm font-semibold leading-relaxed text-ink-muted">
              {customer
                ? "View recent orders and track shipments. Guest checkout still works anytime."
                : "Sign in or create an account. Guest checkout and wishlist stay available anytime."}
            </p>
          </div>

          <div className="mt-10 w-full">
            {customer ? (
              <AccountDashboard customer={customer} />
            ) : (
              <AccountAuthForm
                configured={configured}
                clientId={clientId}
                storefrontOrigin={storefrontOrigin}
                error={error ?? null}
              />
            )}
          </div>

          {!customer ? (
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/shop"
                className="border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
              >
                Shop all
              </Link>
              <a
                href={site.messageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand"
              >
                {site.whatsappLabel}
              </a>
            </div>
          ) : null}
        </div>
      </section>

      <Footer viewport snap className="account-page" />
    </>
  );
}
