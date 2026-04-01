import type { Metadata } from "next";
import { PricingCard } from "@/components/shared/PricingCard";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FEATURES, PRICING } from "@/config/pricing";
import { Check, Shield, X } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing – DocForge PDF Tools",
  description: `Start your 7-day trial for just ${PRICING.trial.label}. Full PDF editing, conversion, and signing. Then ${PRICING.monthly.label}/month. Cancel anytime.`,
  alternates: { canonical: "/pricing" },
};

const billingFaqs = [
  {
    question: "How does the trial work?",
    answer: `You pay ${PRICING.trial.label} today and get full Premium access for ${PRICING.trial.days} days. After the trial, your subscription automatically renews at ${PRICING.monthly.label}/month. You can cancel at any time before the trial ends to avoid being charged.`,
  },
  {
    question: "When will I be charged?",
    answer: `You are charged ${PRICING.trial.label} immediately when you start the trial. The next charge of ${PRICING.monthly.label} occurs after ${PRICING.trial.days} days, and then monthly on the same date.`,
  },
  {
    question: "How do I cancel?",
    answer: "Log into your account, go to Dashboard → Billing → Cancel Subscription. Cancelling stops all future renewals. You keep access until the end of your current billing period.",
  },
  {
    question: "Can I get a refund?",
    answer: "The $0.99 trial fee is non-refundable. For monthly charges, we offer refunds within 3 days if you have not downloaded any files. Please contact support@docforge.app.",
  },
  {
    question: "Is there a yearly plan?",
    answer: `Yes! The yearly plan costs ${PRICING.yearly.label}/year (${PRICING.yearly.savings} savings vs monthly). Contact us or check your dashboard for the yearly upgrade option.`,
  },
  {
    question: "What happens to my files if I cancel?",
    answer: "All files are automatically deleted after 2 hours regardless of subscription status. Cancelling your subscription does not affect file processing — you keep access until the end of your billing period.",
  },
];

const comparisonFeatures = [
  { name: "Upload & preview PDFs", free: true, premium: true },
  { name: "Try all editing tools", free: true, premium: true },
  { name: "Download processed files", free: false, premium: true },
  { name: "File size limit", free: "5MB", premium: "100MB" },
  { name: "Downloads per day", free: "1", premium: "Unlimited" },
  { name: "Watermark-free output", free: false, premium: true },
  { name: "Batch processing", free: false, premium: true },
  { name: "Priority processing", free: false, premium: true },
  { name: "Advanced OCR", free: false, premium: true },
  { name: "File history (30 days)", free: false, premium: true },
  { name: "Email support", free: false, premium: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 text-center gradient-hero">
        <div className="container mx-auto max-w-3xl px-4">
          <Badge variant="secondary" className="mb-4">Simple, transparent pricing</Badge>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
            Start for less than a coffee
          </h1>
          <p className="mb-4 text-lg text-muted-foreground">
            Try DocForge Premium for {PRICING.trial.days} days at just{" "}
            <strong>{PRICING.trial.label}</strong>. Then only{" "}
            {PRICING.monthly.label}/month. Cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground">
            No hidden fees · No contracts · Cancel in one click
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16 border-t">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="grid gap-6 md:grid-cols-2">
            <PricingCard
              variant="free"
              features={FEATURES.free}
            />
            <PricingCard
              variant="pro"
              features={FEATURES.premium}
              highlighted
            />
          </div>

          {/* Subscription disclosure */}
          <div className="mt-6 rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                <strong>Subscription terms:</strong> The {PRICING.trial.days}-day trial is{" "}
                {PRICING.trial.label}. After the trial period, your subscription
                automatically renews at {PRICING.monthly.label}/month until you cancel.
                Renewal date and amount are always visible in your account dashboard.
                Cancel anytime from{" "}
                <Link href="/dashboard/billing" className="underline">
                  Account → Billing
                </Link>{" "}
                or email{" "}
                <a href="mailto:support@docforge.app" className="underline">
                  support@docforge.app
                </a>
                . See full{" "}
                <Link href="/legal/subscription" className="underline">
                  Subscription Terms
                </Link>.
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Feature comparison table */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">Free vs Premium</h2>
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-5 py-3 text-left text-sm font-semibold">Feature</th>
                  <th className="px-5 py-3 text-center text-sm font-semibold">Free</th>
                  <th className="px-5 py-3 text-center text-sm font-semibold text-primary">Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisonFeatures.map((f) => (
                  <tr key={f.name} className="hover:bg-muted/20">
                    <td className="px-5 py-3 text-sm">{f.name}</td>
                    <td className="px-5 py-3 text-center">
                      {typeof f.free === "boolean" ? (
                        f.free ? (
                          <Check className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{f.free}</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {typeof f.premium === "boolean" ? (
                        f.premium ? (
                          <Check className="mx-auto h-4 w-4 text-primary" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground/50" />
                        )
                      ) : (
                        <span className="text-sm font-medium text-primary">{f.premium}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Guarantee */}
      <section className="py-14 border-t">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <div className="flex h-14 w-14 mx-auto mb-4 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Shield className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="mb-3 text-2xl font-bold">Easy cancellation, guaranteed</h2>
          <p className="text-muted-foreground">
            We believe in complete transparency. Cancel anytime from your account dashboard
            in one click — no phone calls, no emails, no hoops to jump through.
            We&apos;ll never trap you in a subscription you don&apos;t want.
          </p>
        </div>
      </section>

      {/* Billing FAQs */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">Billing FAQ</h2>
          <FaqAccordion items={billingFaqs} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 border-t">
        <div className="container mx-auto max-w-xl px-4 text-center">
          <h2 className="mb-3 text-2xl font-bold">Ready to go Premium?</h2>
          <p className="mb-6 text-muted-foreground">
            Start your {PRICING.trial.days}-day trial now. Cancel any time.
          </p>
          <Button size="lg" className="w-full sm:w-auto" asChild>
            <Link href="/checkout">
              Start Trial — {PRICING.trial.label}
            </Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Then {PRICING.monthly.label}/month · Cancel before trial ends to pay nothing more
          </p>
        </div>
      </section>
    </div>
  );
}
