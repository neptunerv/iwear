import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Common questions about shopping at ${site.name} — authenticity, fit, shipping, and stores.`,
};

const faqs = [
  {
    q: "Are your sunglasses authentic?",
    a: `Yes. ${site.name} is an authorized reseller. Ray-Ban, Oakley, and other branded frames are sourced through official channels — never grey-market replicas.`,
  },
  {
    q: "Which brands can I buy online?",
    a: "Online we currently sell Ray-Ban, Oakley, Swarovski, and Scuderia Ferrari. Many more brands — including Prada, Gucci, Dior, and Tiffany & Co. — are available to try in our Bali stores.",
  },
  {
    q: "How do I know my size?",
    a: "Each product page lists lens width, bridge, and temple measurements when available. If you are unsure, visit Beachwalk or Icon Mall Sanur and our team will help you get fitted.",
  },
  {
    q: "Do you ship outside Bali?",
    a: "Yes. Bali delivery is free. We also ship across Indonesia and offer international shipping at checkout where available. See Shipping & returns for details.",
  },
  {
    q: "What is your return policy?",
    a: "Unworn frames in original packaging can be returned or exchanged within 7 days with proof of purchase. Start a return via Instagram (or WhatsApp when configured) or visit either store.",
  },
  {
    q: "How does warranty work?",
    a: "Manufacturer warranties cover defects in materials and workmanship. Bring your frames and receipt to either store, or message us for online orders. See the Warranty page for full details.",
  },
  {
    q: "Do you offer prescription lenses?",
    a: "Ask in store about prescription and lens options for eligible frames. Online checkout currently focuses on ready-to-wear sunglasses as listed on each product page.",
  },
] as const;

export default function FaqPage() {
  return (
    <LegalPage eyebrow="Help" title="FAQ">
      {faqs.map((item) => (
        <div key={item.q}>
          <h2 className="font-poster text-2xl uppercase text-ink">{item.q}</h2>
          <p className="mt-3">{item.a}</p>
        </div>
      ))}

      <p>
        Still need help?{" "}
        <a
          href={site.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          Message us
        </a>
        , email{" "}
        <a href={`mailto:${site.email}`} className="underline underline-offset-4">
          {site.email}
        </a>
        , or{" "}
        <Link href="/stores" className="underline underline-offset-4">
          visit a store
        </Link>
        .
      </p>
    </LegalPage>
  );
}
