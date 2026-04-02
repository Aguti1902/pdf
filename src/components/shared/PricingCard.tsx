"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PRICING } from "@/config/pricing";

interface PricingCardProps {
  features: string[];
  className?: string;
}

export function PricingCard({ features, className }: PricingCardProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border-2 border-primary bg-card p-8 shadow-lg shadow-primary/10",
        className
      )}
    >
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 text-xs font-bold">
        Full Access
      </Badge>

      <div className="mb-6">
        <h3 className="text-xl font-bold">PDFCraft Premium</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          All tools unlocked. Unlimited downloads.
        </p>
      </div>

      {/* Trial price */}
      <div className="mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Today</p>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-extrabold text-primary">{PRICING.trial.label}</span>
          <span className="text-sm text-muted-foreground">/ {PRICING.trial.days}-day trial</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Then <strong>{PRICING.monthly.label}/month</strong> — cancel before trial ends to pay nothing more
        </p>
      </div>

      <Button size="lg" className="mt-4 mb-6 w-full font-bold gap-2" asChild>
        <Link href="/checkout">
          <Lock className="h-4 w-4" />
          Start {PRICING.trial.days}-Day Trial — {PRICING.trial.label}
        </Link>
      </Button>

      <ul className="space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
