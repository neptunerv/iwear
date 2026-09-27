import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: `Shipping and returns at ${site.name} are coming soon.`,
};

export default function ShippingPage() {
  return (
    <LegalPage eyebrow="Trust" title="Shipping & returns">
      <p>Coming soon.</p>
      <p>
        Delivery and returns aren&rsquo;t published yet. Message us on{" "}
        <a
          href={site.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline underline-offset-4"
        >
          {site.whatsappLabel}
        </a>{" "}
        or email{" "}
        <a
          href={`mailto:${site.email}`}
          className="text-ink underline underline-offset-4"
        >
          {site.email}
        </a>{" "}
        if you need something sent or brought back.
      </p>
    </LegalPage>
  );
}
