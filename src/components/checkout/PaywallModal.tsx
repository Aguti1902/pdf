"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Shield, Star, FileCheck, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { PRICING } from "@/config/pricing";
import { toast } from "sonner";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
  userEmail?: string;
  userName?: string;
}

const benefits = [
  "Download your processed document instantly",
  "Full access to all PDF editing tools",
  "Edit, sign, annotate & convert PDFs",
  "Files up to 100MB — no watermarks",
  "Cancel anytime from your account",
];

export function PaywallModal({ open, onClose, toolName, userEmail, userName }: PaywallModalProps) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:   PRICING.monthly.stripePriceId,
          userEmail: userEmail,
          userName:  userName,
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
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="gradient-primary px-6 py-5 text-white">
          <div className="flex items-center gap-2 mb-1">
            <FileCheck className="h-4 w-4" />
            <span className="text-sm font-medium opacity-90">
              {toolName ? `${toolName} ready` : "Your document is ready!"}
            </span>
          </div>
          <p className="text-lg font-bold leading-snug">
            Subscribe to download and export your work
          </p>
        </div>

        <div className="px-6 py-5">
          {/* Social proof */}
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
            <div className="flex shrink-0">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
            </div>
            <p className="text-xs font-medium">Trusted by 500,000+ users worldwide</p>
          </div>

          {/* Pricing block */}
          <div className="mb-5 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
            <div className="flex items-baseline justify-between mb-1">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Due today</p>
                <p className="text-3xl font-extrabold text-primary">{PRICING.trial.label}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{PRICING.trial.days}-day full access</p>
                <p className="text-xs font-medium text-muted-foreground">then {PRICING.monthly.label}/month</p>
              </div>
            </div>
            <div className="mt-2 h-px bg-border" />
            <p className="mt-2 text-xs text-muted-foreground">
              After {PRICING.trial.days} days your subscription renews at{" "}
              <strong>{PRICING.monthly.label}/month</strong>. Cancel anytime.
            </p>
          </div>

          {/* Benefits */}
          <ul className="mb-5 space-y-2">
            {benefits.map(b => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {b}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button
            size="lg"
            className="w-full text-base font-bold"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to Stripe...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay {PRICING.trial.label} — Start trial
              </>
            )}
          </Button>

          {/* Legal */}
          <div className="mt-3 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>
              {PRICING.trial.days}-day trial at {PRICING.trial.label}, then {PRICING.monthly.label}/month automatically.
              Cancel before trial ends to avoid charges.{" "}
              <Link href="/legal/subscription" className="underline hover:text-foreground">Subscription terms</Link>.
            </span>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            <button onClick={onClose} className="underline cursor-pointer hover:text-foreground">
              No thanks, continue editing
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
