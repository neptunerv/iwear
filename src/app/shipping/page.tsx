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
      <p>
        {site.name} delivers authentic eyewear from our Bali stores and online
        checkout. Delivery options and timing depend on where your order is
        going.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Bali delivery</h2>
      <p>
        Free delivery across Bali for online orders. Same-day delivery is
        available in the Kuta and Sanur areas when you order before 14:00 and
        stock is confirmed at the nearest store. Elsewhere in Bali, expect
        1–2 business days.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">
        Indonesia &amp; international
      </h2>
      <p>
        Nationwide Indonesia shipping typically takes 1–3 business days after
        dispatch. International shipping is offered at Shopify checkout where
        rates and carriers are available — duties and taxes may apply at
        destination.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">
        Returns &amp; exchanges
      </h2>
      <p>
        Unworn frames in original packaging may be returned or exchanged within
        7 days of delivery or in-store purchase, with proof of purchase.
        Custom, prescription, or clearly used items are not eligible. Store
        credit or exchange is preferred; refunds for online orders are issued
        to the original payment method after we receive and inspect the return.
      </p>
      <p>
        To start a return, message us on{" "}
        <a
          href={site.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {site.whatsapp ? "WhatsApp" : "Instagram"}
        </a>{" "}
        or visit Beachwalk Kuta or Icon Mall Sanur with your receipt.
      </p>
    </LegalPage>
  );
}
