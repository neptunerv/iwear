import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: `How ${site.name} collects and uses your personal information.`,
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Legal" title="Privacy policy" updated="August 2026">
      <p>
        {site.name} (&ldquo;iWear&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;)
        respects your privacy. This policy explains what information we
        collect when you shop with us online or in store at Beachwalk Kuta or
        Icon Mall Sanur, and how we use it.
      </p>

      <h2 className="font-poster text-xl uppercase">Information we collect</h2>
      <ul>
        <li>
          <span className="text-ink">Contact &amp; order details</span>: name,
          email, phone, shipping address, and the items you order, collected
          when you check out or create an account.
        </li>
        <li>
          <span className="text-ink">Account information</span>: if you sign
          in with a Shopify customer account, we can see your order history
          and saved details.
        </li>
        <li>
          <span className="text-ink">Browsing data</span>: pages viewed,
          device and browser type, and approximate location, collected
          automatically via cookies and analytics tools.
        </li>
        <li>
          <span className="text-ink">Communications</span>: messages you send
          us over WhatsApp, Instagram, or email when asking about an order,
          fit, or warranty claim.
        </li>
      </ul>

      <h2 className="font-poster text-xl uppercase">How we use it</h2>
      <p>We use your information to:</p>
      <ul>
        <li>Process and deliver orders, and keep you updated on their status</li>
        <li>Provide customer service, including warranty and return requests</li>
        <li>
          Improve the site and our catalog based on what shoppers browse and
          buy
        </li>
        <li>
          Send order-related messages, and marketing updates only if you
          opt in
        </li>
        <li>Prevent fraud and keep the store secure</li>
      </ul>

      <h2 className="font-poster text-xl uppercase">Cookies &amp; analytics</h2>
      <p>
        We use cookies for cart and checkout functionality, and analytics
        tools (including Vercel Analytics and Google Analytics, where
        enabled) to understand how shoppers use the site. You can control
        cookies through your browser settings, though parts of checkout may
        not work with cookies disabled.
      </p>

      <h2 className="font-poster text-xl uppercase">Who we share it with</h2>
      <p>
        Checkout, payments, and order storage run on Shopify&rsquo;s
        platform. We share the minimum information needed with couriers to
        deliver your order, and with payment providers to process it
        securely. We do not sell your personal information to third
        parties.
      </p>

      <h2 className="font-poster text-xl uppercase">Data retention &amp; security</h2>
      <p>
        We keep order and account records for as long as needed to meet
        legal, tax, and warranty obligations, and take reasonable technical
        and organizational measures to protect your information against
        loss or unauthorized access.
      </p>

      <h2 className="font-poster text-xl uppercase">Your rights</h2>
      <p>
        You can ask us to access, correct, or delete your personal
        information, and to opt out of marketing at any time, in line with
        Indonesia&rsquo;s Personal Data Protection Law (UU No. 27/2022).
        Contact us using the details below to make a request.
      </p>

      <h2 className="font-poster text-xl uppercase">Changes to this policy</h2>
      <p>
        We may update this policy as our practices change. The date above
        reflects the latest revision. Check back occasionally for updates.
      </p>

      <h2 className="font-poster text-xl uppercase">Contact us</h2>
      <p>
        Questions about this policy? Email{" "}
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
