import type { Metadata } from "next";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FEATURES, PRICING } from "@/config/pricing";
import { Check, Shield, Lock, Star } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing – DocForge PDF Tools",
  description: `Full access to all PDF tools for just ${PRICING.trial.label} for ${PRICING.trial.days} days, then ${PRICING.monthly.label}/month. Cancel anytime.`,
  alternates: { canonical: "/pricing" },
};

const billingFaqs = [
  {
    question: "How does the trial work?",
    answer: `You pay ${PRICING.trial.label} today and get full access to all tools for ${PRICING.trial.days} days. After the trial, your subscription automatically renews at ${PRICING.monthly.label}/month until you cancel.`,
  },
  {
    question: "Is there a free plan?",
    answer: "No. DocForge is a professional subscription tool. You can view the editor interface for free, but downloading any processed document requires an active subscription. The trial at 0,50 € gives you full access for 7 days.",
  },
  {
    question: "When will I be charged after the trial?",
    answer: `Your next charge of ${PRICING.monthly.label} occurs exactly ${PRICING.trial.days} days after you start the trial. Then monthly on the same date until cancelled.`,
  },
  {
    question: "How do I cancel?",
    answer: "Log in → Dashboard → Billing → Cancel Subscription. Cancellation takes effect immediately — no future charges. You keep access until the end of the current period.",
  },
  {
    question: "Can I get a refund?",
    answer: `The ${PRICING.trial.label} trial fee is non-refundable. Monthly charges can be refunded within 3 days if no files were downloaded. Contact support@docforge.app.`,
  },
  {
    question: "What happens if I don't cancel before the trial ends?",
    answer: `Your subscription automatically renews at ${PRICING.monthly.label}/month. We send a reminder email 3 days before the trial ends. You can cancel at any time.`,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="py-20 text-center gradient-hero">
        <div className="container mx-auto max-w-2xl px-4">
          <Badge variant="secondary" className="mb-4">Simple, transparent pricing</Badge>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
            One plan. Full access.
          </h1>
          <p className="mb-2 text-lg text-muted-foreground">
            Start your <strong>{PRICING.trial.days}-day trial</strong> for just{" "}
            <strong className="text-primary">{PRICING.trial.label}</strong>.
            Then only <strong>{PRICING.monthly.label}/month</strong>.
          </p>
          <p className="text-sm text-muted-foreground">
            Cancel anytime · No hidden fees · Billed monthly
          </p>
        </div>
      </section>

      {/* Single plan card */}
      <section className="py-16 border-t">
        <div className="container mx-auto max-w-lg px-4">
          <div className="relative rounded-2xl border-2 border-primary bg-card p-8 shadow-lg shadow-primary/10">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 text-sm font-bold">
              Full Access
            </Badge>

            {/* Stars */}
            <div className="mb-4 flex justify-center gap-0.5">
              {[1,2,3,4,5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
              <span className="ml-2 text-sm text-muted-foreground">4.8 · 50K+ reviews</span>
            </div>

            {/* Price */}
            <div className="mb-2 text-center">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">Today only</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-extrabold text-primary">{PRICING.trial.label}</span>
                <span className="text-muted-foreground text-sm">/{PRICING.trial.days}-day trial</span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Then <strong>{PRICING.monthly.label}/month</strong> — cancel before trial ends to pay nothing more
              </p>
            </div>

            {/* CTA */}
            <Button size="lg" className="mt-5 mb-6 w-full text-base font-bold" asChild>
              <Link href="/checkout">
                <Lock className="mr-2 h-4 w-4" />
                Start {PRICING.trial.days}-Day Trial — {PRICING.trial.label}
              </Link>
            </Button>

            {/* Features */}
            <ul className="space-y-2.5">
              {FEATURES.premium.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Disclosure */}
            <div className="mt-6 rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p>
                  By subscribing you agree to a {PRICING.trial.days}-day trial at {PRICING.trial.label},
                  after which <strong>{PRICING.monthly.label}/month</strong> will be charged automatically
                  until cancelled. Cancel anytime from{" "}
                  <Link href="/dashboard/billing" className="underline">Account → Billing</Link>.
                  See <Link href="/legal/subscription" className="underline">Subscription Terms</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust row */}
      <section className="py-10 border-t bg-muted/20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 text-center">
            {[
              { value: "500K+", label: "Users worldwide" },
              { value: "10M+", label: "Files processed" },
              { value: "4.8★", label: "Average rating" },
              { value: "100%", label: "Secure & private" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-2xl font-extrabold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cancel guarantee */}
      <section className="py-14 border-t">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <Shield className="h-7 w-7 text-green-600" />
          </div>
          <h2 className="mb-3 text-2xl font-bold">Easy cancellation, guaranteed</h2>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Cancel anytime in one click from your account dashboard. No phone calls,
            no forms, no tricks. If you cancel before the trial ends, you pay nothing more.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 bg-muted/30 border-t">
        <div className="container mx-auto max-w-2xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold">Billing FAQ</h2>
          <FaqAccordion items={billingFaqs} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-14 border-t">
        <div className="container mx-auto max-w-md px-4 text-center">
          <h2 className="mb-2 text-2xl font-bold">Ready to get started?</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {PRICING.trial.days}-day full access trial · {PRICING.trial.label} today · {PRICING.monthly.label}/month after
          </p>
          <Button size="lg" className="w-full font-bold" asChild>
            <Link href="/checkout">Start Trial — {PRICING.trial.label}</Link>
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            Cancel before {PRICING.trial.days} days to pay nothing more
          </p>
        </div>
      </section>
    </div>
  );
}
