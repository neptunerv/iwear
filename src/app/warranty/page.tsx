import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Warranty",
  description: `Warranty details at ${site.name} are coming soon.`,
};

export default function WarrantyPage() {
  return (
    <LegalPage eyebrow="Trust" title="Warranty">
      <p>Coming soon.</p>
      <p>
        Warranty details aren&rsquo;t published yet. Message us on{" "}
        <a
          href={site.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline underline-offset-4"
        >
          {site.whatsappLabel}
        </a>{" "}
        or visit Beachwalk Kuta or Icon Mall Sanur if a frame needs a look.
      </p>
    </LegalPage>
  );
}
