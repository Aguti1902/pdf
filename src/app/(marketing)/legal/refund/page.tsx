import type { Metadata } from "next";
import { SITE } from "@/config/seo";

export const metadata: Metadata = {
  title: "Refund Policy – DocForge",
};

export default function RefundPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Refund Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 1, 2026</p>
      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">Trial Fee</h2>
          <p className="text-muted-foreground">The $0.99 trial fee is non-refundable. It covers the cost of providing full Premium access during the trial period.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Monthly Subscription Charges</h2>
          <p className="text-muted-foreground">Refunds for monthly subscription charges are available within 3 days of the charge date, provided you have not downloaded any files during that billing period. To request a refund, contact <a href={`mailto:${SITE.supportEmail}`} className="text-primary underline">{SITE.supportEmail}</a> with your account email and reason.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">How to Cancel to Avoid Future Charges</h2>
          <p className="text-muted-foreground">The best way to avoid future charges is to cancel before your trial or billing period ends. Go to Account → Billing → Cancel Subscription. Cancellation is instant and confirmed by email.</p>
        </section>
        <section>
          <h2 className="text-lg font-bold mb-2">Disputes</h2>
          <p className="text-muted-foreground">Before disputing a charge with your bank, please contact us first. We resolve billing issues quickly and prefer to handle them directly to avoid inconvenience for both parties.</p>
        </section>
      </div>
    </div>
  );
}
