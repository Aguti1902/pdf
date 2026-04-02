import type { Metadata } from "next";
import { SITE } from "@/config/seo";
import { PRICING } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Refund Policy – PDFCraft",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Refund Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 1, 2026</p>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">Trial Fee ({PRICING.trial.label})</h2>
          <p className="text-muted-foreground">The {PRICING.trial.label} trial fee is non-refundable. It covers the cost of providing full Premium access during the {PRICING.trial.days}-day trial period.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Monthly Subscription Charges ({PRICING.monthly.label}/month)</h2>
          <p className="text-muted-foreground">Refunds for monthly charges are available within 3 days of the charge date, provided you have not downloaded any files during that billing period. To request a refund, email <a href={`mailto:${SITE.supportEmail}`} className="text-primary underline">{SITE.supportEmail}</a> with your account email and reason.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">How to avoid future charges</h2>
          <p className="text-muted-foreground">Cancel before your trial or billing period ends via Account → Billing → Cancel Subscription. Cancellation is instant and confirmed by email. If you cancel during the trial, no monthly charge will apply.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Chargebacks & Disputes</h2>
          <p className="text-muted-foreground">Before disputing a charge with your bank, please contact us first at <a href={`mailto:${SITE.supportEmail}`} className="text-primary underline">{SITE.supportEmail}</a>. We resolve billing issues quickly. Initiating a chargeback without contacting us first may result in account suspension.</p>
        </section>
      </div>
    </div>
  );
}
