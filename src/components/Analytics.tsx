"use client";

import dynamic from "next/dynamic";
import Script from "next/script";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();

/**
 * Load Vercel Analytics client-only. The package’s CJS build uses `require()`,
 * which Turbopack can evaluate in an ESM SSR context and crash brand routes.
 */
const VercelAnalytics = dynamic(
  () =>
    import("@vercel/analytics/react").then((mod) => mod.Analytics),
  { ssr: false },
);

export function Analytics() {
  return (
    <>
      <VercelAnalytics />
      {gaId ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
    </>
  );
}
