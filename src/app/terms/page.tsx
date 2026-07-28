import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `Terms and conditions for shopping at ${site.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of use">
      <p>Placeholder — full terms coming soon.</p>
    </LegalPage>
  );
}
