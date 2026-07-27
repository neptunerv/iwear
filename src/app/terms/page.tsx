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
      <p>
        By using the {site.name} website or purchasing from our stores, you
        agree to these terms. If you do not agree, please do not use the site or
        place an order.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Who we are</h2>
      <p>
        {site.name} is an authorized eyewear reseller based in Bali, Indonesia,
        with stores at Beachwalk Shopping Center (Kuta) and Icon Bali Mall
        (Sanur). Online orders are fulfilled through our Shopify storefront.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Products &amp; pricing</h2>
      <p>
        We sell authentic branded eyewear. Product availability, images, and
        prices (shown in IDR unless stated otherwise) may change without notice.
        We reserve the right to cancel orders placed in error (for example,
        incorrect pricing or out-of-stock items) and will notify you if that
        happens.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Orders &amp; payment</h2>
      <p>
        Online checkout is processed by Shopify. A contract for sale is formed
        when payment is accepted and we confirm the order. You are responsible
        for providing accurate shipping and contact details.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Authenticity</h2>
      <p>
        Frames sold as Ray-Ban, Oakley, and other listed brands are sourced
        through authorized channels. Brand names and logos remain trademarks of
        their respective owners; {site.name} is a reseller, not the brand owner.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">
        Limitation of liability
      </h2>
      <p>
        To the fullest extent permitted by Indonesian law, {site.name} is not
        liable for indirect or consequential losses arising from use of the
        website or products, except where liability cannot be excluded (for
        example, for fraud or personal injury caused by negligence).
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Governing law</h2>
      <p>
        These terms are governed by the laws of the Republic of Indonesia.
        Disputes will be handled in the courts of Bali, Indonesia, unless
        mandatory consumer protections require otherwise.
      </p>

      <p>
        Questions? Email{" "}
        <a href={`mailto:${site.email}`} className="underline underline-offset-4">
          {site.email}
        </a>{" "}
        or message us on{" "}
        <a
          href={site.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-4"
        >
          {site.whatsapp ? "WhatsApp" : "Instagram"}
        </a>
        .
      </p>

      <p className="text-sm">Last updated: July 2026</p>
    </LegalPage>
  );
}
