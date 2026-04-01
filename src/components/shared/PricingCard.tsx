"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { PRICING } from "@/config/pricing";

interface PricingCardProps {
  variant: "free" | "pro";
  features: string[];
  highlighted?: boolean;
  className?: string;
}

export function PricingCard({ variant, features, highlighted, className }: PricingCardProps) {
  const isFree = variant === "free";

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-card p-8 shadow-sm transition-shadow hover:shadow-md",
        highlighted && "border-primary ring-2 ring-primary/20 shadow-lg",
        className
      )}
    >
      {highlighted && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary px-4 py-1 text-xs font-semibold">
          Most Popular
        </Badge>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold">{isFree ? "Free" : "Premium"}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {isFree ? "Try all tools, no credit card required." : "Full access, unlimited downloads."}
        </p>
      </div>

      {isFree ? (
        <div className="mb-6">
          <span className="text-4xl font-extrabold">$0</span>
          <span className="ml-1 text-sm text-muted-foreground">/ forever</span>
        </div>
      ) : (
        <div className="mb-2">
          <div className="flex items-end gap-1">
            <span className="text-4xl font-extrabold">{PRICING.trial.label}</span>
            <span className="mb-1 text-sm text-muted-foreground">/ {PRICING.trial.days}-day trial</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Then {PRICING.monthly.label}/month. Cancel anytime.
          </p>
        </div>
      )}

      <Button
        asChild
        variant={highlighted ? "default" : "outline"}
        size="lg"
        className={cn("mt-2 mb-6 w-full", highlighted && "shadow-sm")}
      >
        <Link href={isFree ? "/signup" : "/checkout"}>
          {isFree ? "Start for Free" : `Start ${PRICING.trial.days}-Day Trial`}
        </Link>
      </Button>

      <ul className="space-y-3">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm">
            <Check className={cn("mt-0.5 h-4 w-4 shrink-0", highlighted ? "text-primary" : "text-green-500")} />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
