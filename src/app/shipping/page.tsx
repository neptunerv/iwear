import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: `Delivery and return policy for ${site.name} orders in Bali and beyond.`,
};

export default function ShippingPage() {
  return (
    <LegalPage eyebrow="Trust" title="Shipping & returns">
      <p>Placeholder — shipping and returns details coming soon.</p>
    </LegalPage>
  );
}
