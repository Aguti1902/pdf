import type { Metadata } from "next";
import { SITE } from "@/config/seo";
import { PRICING } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Subscription Terms – PDFCraft",
  description: "Read PDFCraft's Subscription Terms and cancellation policy.",
};

export default function SubscriptionTermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Subscription Terms</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 1, 2026</p>

      {/* Plain language summary */}
      <div className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
        <h2 className="mb-3 font-bold text-base">Summary (plain language)</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>✓ Trial: <strong>{PRICING.trial.label}</strong> for {PRICING.trial.days} days of full access</li>
          <li>✓ After trial: <strong>{PRICING.monthly.label}/month</strong>, charged automatically on the same date</li>
          <li>✓ No free plan — downloading requires an active subscription</li>
          <li>✓ Cancel: any time from Account → Billing → Cancel Subscription</li>
          <li>✓ Access continues until end of paid period after cancellation</li>
          <li>✓ Renewal amount and date always visible in your account dashboard</li>
        </ul>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">1. No Free Tier</h2>
          <p className="text-muted-foreground">
            PDFCraft does not offer a free download plan. You may open and preview documents in the editor without a subscription. However, downloading or exporting any processed document requires an active paid subscription.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Trial Period</h2>
          <p className="text-muted-foreground">
            The {PRICING.trial.days}-day trial gives you complete access to all Premium features for a one-time fee of {PRICING.trial.label}. The trial begins immediately upon successful payment. The trial fee is non-refundable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Automatic Renewal</h2>
          <p className="text-muted-foreground">
            After the trial period ends, your subscription <strong>automatically renews at {PRICING.monthly.label}/month</strong>. You will be charged on the same calendar day each month (e.g. trial started April 1 → next charge May 1 → June 1, etc.) until you cancel.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Renewal Notification</h2>
          <p className="text-muted-foreground">
            We will send a reminder email at least 3 days before your trial ends and at least 3 days before each monthly renewal. Your next billing date and amount are always visible in Account → Billing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Cancellation</h2>
          <p className="text-muted-foreground">
            You may cancel at any time by going to Account → Billing → Cancel Subscription. Cancellation is immediate — no further charges will occur. You retain Premium access until the end of your current billing period. If you cancel during the trial period, no monthly charge will be applied.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Price Changes</h2>
          <p className="text-muted-foreground">
            {SITE.companyName} reserves the right to change subscription pricing with at least 30 days' advance notice by email. Continuing to use the service after the effective date constitutes acceptance of the new price.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Payment Failure</h2>
          <p className="text-muted-foreground">
            If a payment fails, we will retry 3 times over 7 days. If payment cannot be collected, your account will be downgraded to preview-only mode. No service interruption occurs during the retry window.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Contact</h2>
          <p className="text-muted-foreground">
            For billing questions: <a href={`mailto:${SITE.supportEmail}`} className="text-primary underline">{SITE.supportEmail}</a>
          </p>
        </section>
      </div>
    </div>
  );
}
