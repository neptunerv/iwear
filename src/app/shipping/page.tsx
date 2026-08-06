import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & returns",
  description: `Delivery and return policy for ${site.name} orders in Bali and beyond.`,
};

export default function ShippingPage() {
  return (
    <LegalPage eyebrow="Trust" title="Shipping & returns" updated="August 2026">
      <h2 className="font-poster text-xl uppercase">Delivery</h2>
      <ul>
        <li>Same-day delivery across Kuta and Sanur, Bali, on orders placed before 3pm local time.</li>
        <li>Nationwide shipping across Indonesia in 1–3 business days via trusted courier partners.</li>
        <li>You&rsquo;ll get a tracking link by email or WhatsApp once your order ships.</li>
        <li>Shipping cost is calculated at checkout based on your delivery address.</li>
      </ul>

      <h2 className="font-poster text-xl uppercase">In-store pickup</h2>
      <p>
        Choose in-store pickup at checkout to collect your order at
        Beachwalk Kuta or Icon Mall Sanur — free of charge. We&rsquo;ll
        message you as soon as it&rsquo;s ready.
      </p>

      <h2 className="font-poster text-xl uppercase">Returns &amp; exchanges</h2>
      <ul>
        <li>Unworn frames in original condition, with all packaging and tags, can be returned or exchanged within 7 days of delivery.</li>
        <li>Prescription lenses and other made-to-order items are final sale unless faulty.</li>
        <li>To start a return, message us on {site.whatsappLabel} or email {site.email} with your order number — we&rsquo;ll confirm the next step before you send anything back.</li>
        <li>Approved returns can also be dropped off in person at either store.</li>
      </ul>

      <h2 className="font-poster text-xl uppercase">Refunds</h2>
      <p>
        Once we receive and inspect a returned item, we&rsquo;ll refund your
        original payment method within 5–10 business days. Shipping costs
        on the original order are non-refundable unless the return is due
        to our error or a faulty product.
      </p>

      <h2 className="font-poster text-xl uppercase">Manufacturer warranty</h2>
      <p>
        Manufacturing defects are covered separately under each
        brand&rsquo;s warranty — see our{" "}
        <Link href="/warranty" className="text-ink underline underline-offset-4">
          warranty page
        </Link>{" "}
        for what&rsquo;s covered and how to make a claim.
      </p>
    </LegalPage>
  );
}
