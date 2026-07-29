import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Warranty",
  description: `Official manufacturer warranty on every frame at ${site.name}.`,
};

export default function WarrantyPage() {
  return (
    <LegalPage eyebrow="Trust" title="Warranty">
      <p>
        Every Ray-Ban, Oakley, and other brand frame sold at {site.name} includes
        the full manufacturer warranty. We can help with warranty service in
        store.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">What&apos;s covered</h2>
      <p>
        Manufacturer warranties typically cover manufacturing defects in
        materials and workmanship for a limited period from the date of
        purchase. Coverage varies by brand — ask in store or check the materials
        included with your frame for exact terms.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Not covered</h2>
      <p>
        Normal wear, accidental damage, scratches from use, lost parts, and
        unauthorized repairs are generally excluded. Keep your original receipt
        or order confirmation — warranty claims require proof of purchase from{" "}
        {site.name}.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">How to claim</h2>
      <p>
        Bring the frames and proof of purchase to Beachwalk Kuta or Icon Mall
        Sanur. Our team will inspect the product and advise on repair,
        replacement, or manufacturer service. For online orders, message us
        first via{" "}
        <a
          href={site.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {site.whatsapp ? "WhatsApp" : "Instagram"}
        </a>{" "}
        so we can guide the next step.
      </p>
    </LegalPage>
  );
}
