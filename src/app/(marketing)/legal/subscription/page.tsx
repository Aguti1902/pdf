import type { Metadata } from "next";
import { SITE } from "@/config/seo";
import { PRICING } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Subscription Terms – DocForge",
  description: "Read DocForge's Subscription Terms and cancellation policy.",
};

export default function SubscriptionTermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Subscription Terms</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 1, 2026</p>

      <div className="mb-8 rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
        <h2 className="mb-3 font-bold text-base">Summary (plain language)</h2>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          <li>✓ Trial: <strong>{PRICING.trial.label}</strong> for {PRICING.trial.days} days of full Premium access</li>
          <li>✓ After trial: <strong>{PRICING.monthly.label}/month</strong>, automatically charged on the same date</li>
          <li>✓ Cancel: Any time from your Account → Billing → Cancel Subscription</li>
          <li>✓ Access: Continues until end of paid period after cancellation</li>
          <li>✓ Renewal: Always visible in your account dashboard at least 3 days before</li>
        </ul>
      </div>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Trial Period</h2>
          <p className="text-muted-foreground">
            The {PRICING.trial.days}-day trial gives you complete access to all Premium features for a one-time fee of {PRICING.trial.label}. The trial begins immediately upon payment. The trial fee is non-refundable.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Automatic Renewal</h2>
          <p className="text-muted-foreground">
            After the trial period ends, your subscription automatically renews at {PRICING.monthly.label}/month. You will be charged on the same day of each month (e.g., if your trial starts April 1, you will be charged on May 1, June 1, etc.). Renewal charges continue until you cancel.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. Renewal Notification</h2>
          <p className="text-muted-foreground">
            We will send a reminder email at least 3 days before your trial ends and at least 3 days before each monthly renewal. You can view your next billing date at any time in Account → Billing.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Cancellation</h2>
          <p className="text-muted-foreground">
            You may cancel your subscription at any time by logging into your account and navigating to Dashboard → Billing → Cancel Subscription. Cancellation takes effect immediately — no more future charges will occur. You retain Premium access until the end of your current billing period.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Price Changes</h2>
          <p className="text-muted-foreground">
            {SITE.companyName} reserves the right to change subscription pricing. You will be notified at least 30 days before any price change takes effect. Continuing to use the Service after the effective date constitutes acceptance of the new price.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Payment Failure</h2>
          <p className="text-muted-foreground">
            If a payment fails, we will retry the charge 3 times over 7 days. If payment cannot be collected, your account will be downgraded to the free plan. No service interruption occurs during the retry window.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Contact</h2>
          <p className="text-muted-foreground">
            For billing questions, contact us at <a href={`mailto:${SITE.supportEmail}`} className="text-primary underline">{SITE.supportEmail}</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
