import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Common questions about shopping at ${site.name} — authenticity, fit, shipping, and stores.`,
};

export default function FaqPage() {
  return (
    <LegalPage eyebrow="Help" title="FAQ">
      <p>Placeholder — frequently asked questions coming soon.</p>
    </LegalPage>
  );
}
