"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AccountAuthFormProps = {
  configured: boolean;
  clientId: string | null;
  storefrontOrigin: string;
  error?: string | null;
};

type ShopLoginCompleteEvent = {
  signedIn?: boolean;
  email?: string;
  customerAccessToken?: string;
  customerAccessTokenExpiresAt?: string;
};

type ShopLoginErrorEvent = {
  code?: string;
  message?: string;
};

type ShopLoginInstance = {
  element: HTMLElement;
  destroy: () => void;
  start: (email?: string) => void;
};

type ShopSdk = {
  initialize: (options: Record<string, unknown>) => {
    create: (
      feature: "login",
      config: Record<string, unknown>,
    ) => Promise<ShopLoginInstance>;
  };
};

declare global {
  interface Window {
    ShopSDK?: ShopSdk;
  }
}

const SHOP_SDK_SRC =
  "https://cdn.shopify.com/shopifycloud/shop-js/modules/v2/loader.sdk.esm.js";

const errorCopy: Record<string, string> = {
  not_configured:
    "Customer accounts aren’t configured yet. Set Shopify Customer Account API credentials, or checkout as a guest.",
  discovery: "Couldn’t reach Shopify login. Try again in a moment.",
  missing_code: "Login didn’t complete. Please try again.",
  invalid_state: "Login session expired. Please try again.",
  token: "Couldn’t finish signing in. Please try again.",
  shop_session:
    "Signed in with Shop, but we couldn’t open your account. Try email below.",
};

let shopSdkLoader: Promise<void> | null = null;

function loadShopSdk() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.ShopSDK) return Promise.resolve();
  if (shopSdkLoader) return shopSdkLoader;

  shopSdkLoader = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      "script[data-iwear-shop-sdk]",
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => {
          shopSdkLoader = null;
          reject(new Error("Shop SDK failed to load"));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.type = "module";
    script.src = SHOP_SDK_SRC;
    script.dataset.iwearShopSdk = "true";
    script.addEventListener(
      "load",
      () => {
        queueMicrotask(() => {
          if (window.ShopSDK) resolve();
          else {
            shopSdkLoader = null;
            reject(new Error("Shop SDK missing after load"));
          }
        });
      },
      { once: true },
    );
    script.addEventListener(
      "error",
      () => {
        shopSdkLoader = null;
        reject(new Error("Shop SDK failed to load"));
      },
      { once: true },
    );
    document.head.appendChild(script);
  });

  return shopSdkLoader;
}

export function AccountAuthForm({
  configured,
  clientId,
  storefrontOrigin,
  error = null,
}: AccountAuthFormProps) {
  const router = useRouter();
  const emailInputId = useId();
  const mountRef = useRef<HTMLDivElement>(null);
  const loginRef = useRef<ShopLoginInstance | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [shopReady, setShopReady] = useState(false);
  const [shopFailed, setShopFailed] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const message = localError
    ? (errorCopy[localError] ?? localError)
    : error
      ? (errorCopy[error] ?? "Something went wrong. Please try again.")
      : null;

  useEffect(() => {
    if (!configured || !clientId || !mountRef.current) return;

    let cancelled = false;

    async function mountShopLogin() {
      try {
        await loadShopSdk();
        if (cancelled || !mountRef.current || !window.ShopSDK) {
          throw new Error("Shop SDK unavailable");
        }

        const sdk = window.ShopSDK.initialize({
          apiKey: clientId,
          clientId,
          locale: "en",
          features: { login: true },
          appearance: {
            preferredLoginExperience: "popup",
            variables: {
              "--shop-pay-button-width": "100%",
              "--shop-pay-button-height": "52px",
              "--shop-pay-button-border-radius": "0px",
              "--buttons-radius": "0px",
            },
          },
        });

        const login = await sdk.create("login", {
          attributes: {
            buttonType: "continue",
            buttonLayout: "standalone",
            emailInputSelector: `#${CSS.escape(emailInputId)}`,
            clientId,
            storefrontOrigin,
            uxMode: "windoid",
            scope: "openid email customer-account-api:full",
          },
          onComplete: async (event: ShopLoginCompleteEvent) => {
            if (!event.signedIn || !event.customerAccessToken) {
              setLocalError(
                "Sign-in didn’t return an account session. Try again or use email.",
              );
              return;
            }

            setSigningIn(true);
            setLocalError(null);

            try {
              const response = await fetch("/api/auth/shop-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customerAccessToken: event.customerAccessToken,
                  customerAccessTokenExpiresAt:
                    event.customerAccessTokenExpiresAt,
                }),
              });

              if (!response.ok) {
                setLocalError("shop_session");
                setSigningIn(false);
                return;
              }

              router.replace("/account");
              router.refresh();
            } catch {
              setLocalError("shop_session");
              setSigningIn(false);
            }
          },
          onError: (event: ShopLoginErrorEvent) => {
            setLocalError(
              event.message ||
                "Couldn’t complete Shop sign-in. Try email below.",
            );
            setSigningIn(false);
          },
        });

        if (cancelled) {
          login.destroy();
          return;
        }

        mountRef.current.replaceChildren(login.element);
        loginRef.current = login;
        setShopReady(true);
        setShopFailed(false);
      } catch {
        if (!cancelled) {
          setShopFailed(true);
          setShopReady(false);
        }
      }
    }

    void mountShopLogin();

    return () => {
      cancelled = true;
      loginRef.current?.destroy();
      loginRef.current = null;
      if (mountRef.current) mountRef.current.replaceChildren();
    };
  }, [clientId, configured, emailInputId, router, storefrontOrigin]);

  function startEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (signingIn) return;

    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    const value = typeof email === "string" ? email.trim() : "";

    if (loginRef.current && value) {
      setSigningIn(true);
      setLocalError(null);
      loginRef.current.start(value);
      return;
    }

    window.location.href = "/api/auth/login";
  }

  return (
    <div className="w-full">
      {message ? (
        <p className="mb-6 text-sm font-semibold text-brand" role="alert">
          {message}
        </p>
      ) : null}

      {configured ? (
        <div className="space-y-5">
          <div
            className={`overflow-hidden border-2 border-ink transition-opacity ${
              shopReady ? "opacity-100" : "min-h-[52px] opacity-40"
            }`}
          >
            <div
              ref={mountRef}
              className="account-shop-login w-full [&_*]:max-w-none"
              aria-busy={!shopReady && !shopFailed}
            />
          </div>

          {!shopReady && !shopFailed ? (
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
              Loading Shop…
            </p>
          ) : null}

          <div
            className="flex items-center gap-4"
            role="separator"
            aria-label="or"
          >
            <span className="h-px flex-1 bg-ink/20" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-muted">
              or
            </span>
            <span className="h-px flex-1 bg-ink/20" />
          </div>

          <form onSubmit={startEmailLogin}>
            <label className="sr-only" htmlFor={emailInputId}>
              Email
            </label>
            <div className="flex border-2 border-ink bg-cream focus-within:bg-white">
              <input
                id={emailInputId}
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email"
                required
                disabled={signingIn}
                className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm font-semibold text-ink outline-none placeholder:text-ink-muted disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={signingIn}
                aria-label="Continue with email"
                className="border-l-2 border-ink px-4 text-base text-ink transition-colors hover:bg-ink hover:text-brand disabled:opacity-60"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>

          {(shopFailed || localError === "shop_session") && (
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
              className={`flex w-full items-center justify-center border-2 border-ink px-6 py-3.5 text-xs font-bold uppercase tracking-[0.2em] transition-colors ${
                signingIn
                  ? "pointer-events-none bg-ink text-brand"
                  : "hover:bg-ink hover:text-brand"
              }`}
            >
              {signingIn ? "Signing in…" : "Continue with Shopify"}
            </a>
          )}

          <p className="pt-1 text-center text-xs font-semibold text-ink-muted">
            <Link
              href="/privacy"
              className="underline decoration-ink/25 underline-offset-4 transition-colors hover:text-ink hover:decoration-ink"
            >
              Privacy policy
            </Link>
          </p>
        </div>
      ) : (
        <p className="border-2 border-dashed border-ink/20 px-5 py-6 text-sm font-semibold leading-relaxed text-ink-muted">
          Online accounts aren’t connected yet. Ask the store to finish Customer
          Account API setup, or message us for order help.
        </p>
      )}
    </div>
  );
}
