"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import {
  createCustomerAction,
  loginCustomerAction,
} from "@/lib/shopify/customer-actions";

type Mode = "login" | "signup";

const inputClassName =
  "w-full border-b-2 border-ink/20 bg-transparent py-3 text-sm font-semibold text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-ink";

const labelClassName =
  "block text-left text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted";

const ctaClassName =
  "w-full border-2 border-ink px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-brand disabled:cursor-not-allowed disabled:opacity-50";

export function AccountAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function switchMode(next: Mode) {
    setMode(next);
    setError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }

    if (mode === "signup") {
      const confirm = String(form.get("confirmPassword") ?? "");
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
    }

    startTransition(async () => {
      const result =
        mode === "login"
          ? await loginCustomerAction(email, password)
          : await createCustomerAction({
              email,
              password,
              firstName: String(form.get("firstName") ?? "").trim() || undefined,
              lastName: String(form.get("lastName") ?? "").trim() || undefined,
            });

      if (result.error) {
        setError(result.error);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="w-full text-left">
      <div
        role="tablist"
        aria-label="Account"
        className="flex border-b-2 border-ink/15"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "login"}
          onClick={() => switchMode("login")}
          className={`-mb-[2px] flex-1 border-b-2 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
            mode === "login"
              ? "border-ink text-ink"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signup"}
          onClick={() => switchMode("signup")}
          className={`-mb-[2px] flex-1 border-b-2 py-3 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
            mode === "signup"
              ? "border-ink text-ink"
              : "border-transparent text-ink-muted hover:text-ink"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        {mode === "signup" ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="account-first-name" className={labelClassName}>
                First name
              </label>
              <input
                id="account-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                className={inputClassName}
              />
            </div>
            <div>
              <label htmlFor="account-last-name" className={labelClassName}>
                Last name
              </label>
              <input
                id="account-last-name"
                name="lastName"
                type="text"
                autoComplete="family-name"
                className={inputClassName}
              />
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="account-email" className={labelClassName}>
            Email
          </label>
          <input
            id="account-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="account-password" className={labelClassName}>
            Password
          </label>
          <input
            id="account-password"
            name="password"
            type="password"
            autoComplete={
              mode === "login" ? "current-password" : "new-password"
            }
            required
            className={inputClassName}
          />
        </div>

        {mode === "signup" ? (
          <div>
            <label htmlFor="account-confirm-password" className={labelClassName}>
              Confirm password
            </label>
            <input
              id="account-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className={inputClassName}
            />
          </div>
        ) : null}

        {error ? (
          <p className="text-sm font-semibold text-brand" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={isPending} className={ctaClassName}>
          {isPending
            ? mode === "login"
              ? "Logging in…"
              : "Creating…"
            : mode === "login"
              ? "Log in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
