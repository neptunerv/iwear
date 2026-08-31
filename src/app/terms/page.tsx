import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of use",
  description: `Terms and conditions for shopping at ${site.name}.`,
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Legal" title="Terms of use" updated="August 2026">
      <p>
        By using this site or ordering from {site.name}, you agree to the
        terms below. Please read them alongside our{" "}
        <Link href="/shipping" className="text-ink underline underline-offset-4">
          shipping &amp; returns
        </Link>{" "}
        and{" "}
        <Link href="/warranty" className="text-ink underline underline-offset-4">
          warranty
        </Link>{" "}
        pages, which form part of these terms.
      </p>

      <h2 className="font-poster text-xl uppercase">About iWear</h2>
      <p>
        {site.name} is an authorized retail partner selling Ray-Ban, Oakley,
        and other authentic eyewear brands, with stores at Beachwalk Kuta
        and Icon Mall Sanur, Bali, Indonesia. Additional brands are stocked
        in store only and are not available for online checkout.
      </p>

      <h2 className="font-poster text-xl uppercase">Products &amp; pricing</h2>
      <ul>
        <li>All prices are listed in Indonesian Rupiah (IDR) and include applicable taxes unless stated otherwise.</li>
        <li>We try to keep prices and stock accurate, but errors can happen. If a listed price or availability is wrong, we&rsquo;ll contact you before processing the order.</li>
        <li>Product photos are representative; frame color and lens tint can vary slightly by screen and batch.</li>
      </ul>

      <h2 className="font-poster text-xl uppercase">Orders &amp; payment</h2>
      <p>
        Orders are placed and paid for through Shopify&rsquo;s secure
        checkout. An order is confirmed once payment is authorized and you
        receive an order confirmation email. We reserve the right to cancel
        or refuse any order, for example, in cases of suspected fraud,
        pricing errors, or stock unavailability, and will refund any
        payment already taken.
      </p>

      <h2 className="font-poster text-xl uppercase">Shipping, returns &amp; warranty</h2>
      <p>
        Delivery timelines, return eligibility, and manufacturer warranty
        coverage are set out on our{" "}
        <Link href="/shipping" className="text-ink underline underline-offset-4">
          shipping &amp; returns
        </Link>{" "}
        and{" "}
        <Link href="/warranty" className="text-ink underline underline-offset-4">
          warranty
        </Link>{" "}
        pages.
      </p>

      <h2 className="font-poster text-xl uppercase">Your account</h2>
      <p>
        You must provide accurate information when ordering or creating an
        account, and be legally able to enter a binding contract in
        Indonesia. Keep your account credentials confidential. You&rsquo;re
        responsible for activity under your account.
      </p>

      <h2 className="font-poster text-xl uppercase">Intellectual property</h2>
      <p>
        Site content, photography, and the iWear name and mark belong to
        {" "}{site.name} or our licensors. Ray-Ban, Oakley, and other brand
        names, logos, and product designs are trademarks of their respective
        owners and are used to describe genuine products we sell as an
        authorized retailer.
      </p>

      <h2 className="font-poster text-xl uppercase">Liability</h2>
      <p>
        We aren&rsquo;t liable for indirect or consequential losses arising
        from use of the site or products, to the extent permitted by
        Indonesian law. Nothing in these terms limits any right you have
        under Indonesia&rsquo;s consumer protection law (UU No. 8/1999) that
        can&rsquo;t lawfully be excluded.
      </p>

      <h2 className="font-poster text-xl uppercase">Governing law</h2>
      <p>
        These terms are governed by the laws of the Republic of Indonesia.
        Any dispute will be handled in the courts of Bali, Indonesia, unless
        local consumer law gives you the right to bring a claim elsewhere.
      </p>

      <h2 className="font-poster text-xl uppercase">Changes</h2>
      <p>
        We may update these terms from time to time; the date above shows
        the latest revision. Continuing to use the site after changes means
        you accept the updated terms.
      </p>

      <h2 className="font-poster text-xl uppercase">Contact us</h2>
      <p>
        Questions about these terms? Email{" "}
        <a
          href={`mailto:${site.email}`}
          className="text-ink underline underline-offset-4"
        >
          {site.email}
        </a>{" "}
        or message us on{" "}
        <a
          href={site.messageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-ink underline underline-offset-4"
        >
          {site.whatsappLabel}
        </a>
        .
      </p>
    </LegalPage>
  );
}
