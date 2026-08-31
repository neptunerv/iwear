import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: `Common questions about shopping at ${site.name}: authenticity, fit, shipping, and stores.`,
};

function Question({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-poster text-lg uppercase">{q}</h2>
      <p className="mt-2">{children}</p>
    </div>
  );
}

export default function FaqPage() {
  return (
    <LegalPage eyebrow="Help" title="FAQ">
      <Question q="Are your sunglasses authentic?">
        Yes. {site.name} is an authorized retail partner for every brand we
        sell, sourced directly from the manufacturer, never grey market.
        Every pair comes with the full manufacturer warranty.
      </Question>

      <Question q="Which brands can I buy online?">
        {site.brands.join(", ")} are available for online checkout. We also
        carry {site.inStoreBrands.length}+ additional luxury brands,
        including {site.inStoreBrands.slice(0, 4).join(", ")}, and more, in
        our Bali stores only.
      </Question>

      <Question q="Do you sell polarized or prescription lenses?">
        Many of our Ray-Ban and Oakley frames are available with polarized
        lenses. Check the product page for lens options. For prescription
        lenses, visit us in store so our team can fit you properly.
      </Question>

      <Question q="How do I know a frame will fit me?">
        Each product page lists frame width and fit notes. If you&rsquo;re
        unsure, visit Beachwalk Kuta or Icon Mall Sanur to try before you
        buy, or message us on {site.whatsappLabel} with your face
        shape/size for a recommendation.
      </Question>

      <Question q="What payment methods do you accept?">
        Checkout is handled securely by Shopify and supports major cards
        and local Indonesian payment methods. Available options are shown
        at checkout.
      </Question>

      <Question q="How long does shipping take?">
        Same-day across Kuta and Sanur, and 1–3 business days nationwide.
        See our{" "}
        <Link href="/shipping" className="text-ink underline underline-offset-4">
          shipping &amp; returns
        </Link>{" "}
        page for full details.
      </Question>

      <Question q="Can I return or exchange an online order in store?">
        Yes. Bring your order confirmation and the unworn item to either
        store within 7 days of delivery. See our{" "}
        <Link href="/shipping" className="text-ink underline underline-offset-4">
          shipping &amp; returns
        </Link>{" "}
        page for the full policy.
      </Question>

      <Question q="What if my frame has a manufacturing defect?">
        Bring it (or your online order confirmation) to either store and
        we&rsquo;ll handle the manufacturer warranty claim. See our{" "}
        <Link href="/warranty" className="text-ink underline underline-offset-4">
          warranty page
        </Link>{" "}
        for what&rsquo;s covered.
      </Question>

      <Question q="Can I reserve a frame to try in store?">
        Message us on {site.whatsappLabel} with the style you&rsquo;re
        after and which store you&rsquo;ll visit, and we&rsquo;ll hold it
        for you where possible.
      </Question>

      <Question q="Still have a question?">
        Message us on{" "}
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
        </a>
        .
      </Question>
    </LegalPage>
  );
}
