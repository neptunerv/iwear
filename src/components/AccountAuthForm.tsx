"use client";

import { useState } from "react";

type AccountAuthFormProps = {
  configured: boolean;
  error?: string | null;
};

const errorCopy: Record<string, string> = {
  not_configured:
    "Customer accounts aren’t configured yet. Set Shopify Customer Account API credentials, or checkout as a guest.",
  discovery: "Couldn’t reach Shopify login. Try again in a moment.",
  missing_code: "Login didn’t complete. Please try again.",
  invalid_state: "Login session expired. Please try again.",
  token: "Couldn’t finish signing in. Please try again.",
};

export function AccountAuthForm({
  configured,
  error = null,
}: AccountAuthFormProps) {
  const message = error
    ? (errorCopy[error] ?? "Something went wrong. Please try again.")
    : null;
  const [signingIn, setSigningIn] = useState(false);

  return (
    <div className="w-full text-left">
      <p className="text-sm font-semibold leading-relaxed text-ink-muted">
        Sign in with your Shopify customer account to view orders and track
        shipments. Guest checkout still works anytime.
      </p>

      {message ? (
        <p className="mt-4 text-sm font-semibold text-brand" role="alert">
          {message}
        </p>
      ) : null}

      {configured ? (
        <a
          href="/api/auth/login"
          aria-busy={signingIn}
          aria-disabled={signingIn}
          onClick={(event) => {
            if (signingIn) {
              event.preventDefault();
              return;
            }
            setSigningIn(true);
          }}
          className={`mt-8 flex w-full items-center justify-center border-2 border-ink px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
            signingIn
              ? "pointer-events-none bg-ink text-brand"
              : "hover:bg-ink hover:text-brand"
          }`}
        >
          {signingIn ? "Signing in…" : "Sign in with Shopify"}
        </a>
      ) : (
        <p className="mt-8 border-2 border-dashed border-ink/20 px-5 py-6 text-sm font-semibold leading-relaxed text-ink-muted">
          Online accounts aren’t connected yet. Ask the store to finish Customer
          Account API setup, or message us for order help.
        </p>
      )}
    </div>
  );
}
