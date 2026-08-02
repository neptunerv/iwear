import { Anton, Instrument_Serif } from "next/font/google";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { Analytics } from "@/components/Analytics";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Providers } from "@/components/Providers";
import { getCart } from "@/lib/shopify/cart";
import { site } from "@/lib/site";
import "./globals.css";

const anton = Anton({
  variable: "--font-poster",
  subsets: ["latin"],
  weight: "400",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const aspekta = localFont({
  src: "../fonts/AspektaVF.woff2",
  variable: "--font-aspekta",
  weight: "50 1000",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name} — Authentic Ray-Ban & Oakley in Bali`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  metadataBase: new URL(site.url),
  openGraph: {
    type: "website",
    locale: "en_ID",
    siteName: site.name,
    title: `${site.name} — Authentic Ray-Ban & Oakley in Bali`,
    description: site.description,
    url: site.url,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${site.name} — Authentic Ray-Ban & Oakley in Bali`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — Authentic Ray-Ban & Oakley in Bali`,
    description: site.description,
    images: ["/opengraph-image"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialCart = await getCart();

  return (
    <html
      lang="en"
      className={`${anton.variable} ${instrumentSerif.variable} ${aspekta.variable} min-h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream font-sans font-semibold text-ink">
        <Providers initialCart={initialCart}>
          <Header />
          <main id="site-main" className="flex-1">
            {children}
          </main>
          <Footer className="site-footer" />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}
