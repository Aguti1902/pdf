import { Button } from "@/components/ui/button";
import { ArrowRight, Shield } from "lucide-react";
import Link from "next/link";
import { PRICING } from "@/config/pricing";

export function CtaSection() {
  return (
    <section className="py-20 border-t">
      <div className="container mx-auto max-w-3xl px-4 text-center">
        <div className="rounded-3xl gradient-primary p-12 text-white shadow-xl shadow-primary/20">
          <h2 className="mb-4 text-3xl font-extrabold tracking-tight lg:text-4xl">
            Edit and download your PDF now
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg opacity-90">
            Start your {PRICING.trial.days}-day trial for just <strong>{PRICING.trial.label}</strong>.
            Full access to all tools. Cancel before the trial ends and pay nothing more.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2 text-primary font-bold"
              asChild
            >
              <Link href="/checkout">
                Start for {PRICING.trial.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              asChild
            >
              <Link href="/pricing">See Pricing</Link>
            </Button>
          </div>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-sm opacity-75">
            <Shield className="h-4 w-4" />
            <span>
              {PRICING.trial.days}-day trial {PRICING.trial.label} · then {PRICING.monthly.label}/month · Cancel anytime
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
