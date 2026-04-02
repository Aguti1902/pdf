"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { PRICING, CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { CurrencySelector } from "./CurrencySelector";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
  userEmail?: string;
  userName?: string;
}

export function PaywallModal({ open, onClose, toolName: _toolName, userEmail, userName }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const { t, messages } = useLanguage();
  const p = messages ? t("pricingPage") : null;

  const curr = CURRENCIES[currency];

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:   PRICING.monthly.stripePriceId,
          userEmail,
          userName,
          currency,
        }),
      });

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(error);
      }

      const { url } = await res.json();
      if (url) window.location.href = url;
      else throw new Error("No redirect URL received");
    } catch (err) {
      console.error(err);
      toast.error("Could not start checkout. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-lg">

        {/* Currency selector row */}
        <div className="flex justify-center border-b border-border px-6 py-3">
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>

        {/* Today / Then columns */}
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="flex flex-col items-center px-6 py-8">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              {p?.today ?? "Today"}
            </p>
            <p className="text-4xl font-extrabold tracking-tight text-foreground">
              {curr.trialLabel}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {p?.trialLabel ?? `${PRICING.trial.days}-day trial`}
            </p>
          </div>
          <div className="flex flex-col items-center px-6 py-8">
            <p className="mb-2 text-sm font-semibold text-muted-foreground">
              {p?.then ?? "Then"}
            </p>
            <p className="text-4xl font-extrabold tracking-tight text-foreground">
              {curr.monthlyLabel}
            </p>
            <p className="mt-1.5 text-xs text-muted-foreground">
              {p?.monthLabel ?? "Month"}
            </p>
          </div>
        </div>

        {/* Disclosure */}
        <div className="border-t border-border px-6 py-5">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">
            {p?.disclosure
              ? p.disclosure
              : `By activating your ${PRICING.trial.days}-day trial for ${curr.trialLabel}, you are starting a `}
            {!p && (
              <>
                <strong className="font-semibold text-foreground">recurring monthly subscription</strong>.{" "}
                Once the trial period ends, you will be automatically charged {curr.monthlyLabel} each month.
              </>
            )}
          </p>
          {p?.disclosure2 && (
            <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
              {p.disclosure2}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="border-t border-border px-6 pb-6 pt-5 text-center">
          <Button
            size="lg"
            className="w-full rounded-xl bg-foreground text-base font-bold text-background hover:opacity-90"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {p?.redirecting ?? "Redirecting…"}
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                {p?.startBtn ?? `Start ${PRICING.trial.days}-day trial`}
              </>
            )}
          </Button>
          <p className="mt-3 text-xs text-muted-foreground">
            <button onClick={onClose} className="underline underline-offset-2 hover:text-foreground cursor-pointer">
              {p?.cancelAnytime ?? "Cancel anytime"}
            </button>
          </p>
        </div>

        {/* Legal footer */}
        <div className="border-t border-border bg-muted/30 px-6 py-3 text-center text-[11px] text-muted-foreground">
          <Link href="/legal/subscription" className="underline underline-offset-2 hover:text-foreground">
            {p?.subscriptionTerms ?? "Subscription terms"}
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
