import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} collects and uses your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy">
      <p>
        This policy explains how {site.name} (“we”, “us”) collects and uses
        personal information when you browse {site.url}, buy online, or visit
        our Bali stores. We operate in Indonesia and process data as needed to
        run our storefront and fulfill orders.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">
        Information we collect
      </h2>
      <p>
        When you shop online through Shopify checkout, we (and Shopify) may
        process your name, email, shipping address, phone number, and payment
        details. When you message us on Instagram or WhatsApp, we receive the
        information you choose to share. Store visits may involve basic
        purchase records for receipts and warranty support. We also use
        standard website logs and cookies needed for cart, security, and
        analytics.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">How we use it</h2>
      <p>
        We use personal information to process orders, arrange delivery, handle
        returns and warranty claims, answer customer messages, prevent fraud,
        and improve the website. We do not sell your personal information.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">
        Sharing &amp; processors
      </h2>
      <p>
        Checkout and payments are handled by Shopify and its payment partners.
        Couriers receive shipping details to deliver your order. Messaging apps
        (Instagram / WhatsApp) process conversations under their own terms. We
        share data only as needed to operate the business or when required by
        law.
      </p>

      <h2 className="font-poster text-2xl uppercase text-ink">Your choices</h2>
      <p>
        You may request access to or correction of personal information we hold
        about you, or ask us to delete it where we are not required to keep it
        for legal or accounting reasons. Contact us at{" "}
        <a href={`mailto:${site.email}`} className="underline underline-offset-4">
          {site.email}
        </a>{" "}
        or via{" "}
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
