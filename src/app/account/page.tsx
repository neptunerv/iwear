import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { HomeScrollSnap } from "@/components/HomeScrollSnap";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Account",
  description: `Log in or create an account at ${site.name}.`,
  alternates: {
    canonical: "/account",
  },
};

export default function AccountPage() {
  return (
    <>
      <HomeScrollSnap keepHeaderBorder />

      <section
        id="hero"
        className="snap-section relative flex flex-col bg-cream text-ink"
      >
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-12 text-center sm:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink-muted">
            Account
          </p>
          <h1 className="mt-3 font-display text-5xl italic leading-none text-ink sm:text-6xl">
            Sign in
          </h1>
          <p className="mx-auto mt-5 max-w-sm text-sm font-semibold leading-relaxed text-ink-muted">
            Placeholder — account sign-in and orders will live here.
          </p>
        </div>
      </section>

      <Footer viewport snap className="account-page" />
    </>
  );
}
