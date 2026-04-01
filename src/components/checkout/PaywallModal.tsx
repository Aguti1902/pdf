"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Shield, Star, Zap } from "lucide-react";
import Link from "next/link";
import { PRICING } from "@/config/pricing";

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  toolName: string;
}

const benefits = [
  "Unlimited downloads — no daily limits",
  "Access to all 21+ PDF tools",
  "Files up to 100MB",
  "Priority processing speed",
  "No watermarks ever",
];

export function PaywallModal({ open, onClose, toolName }: PaywallModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md gap-0 p-0 overflow-hidden">
        {/* Header gradient */}
        <div className="gradient-primary px-6 py-6 text-white">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium opacity-90">Almost done!</span>
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Download your {toolName} file
          </DialogTitle>
          <p className="mt-1 text-sm opacity-80">
            Start your free trial to download and save your work.
          </p>
        </div>

        <div className="px-6 py-5">
          {/* Social proof */}
          <div className="mb-5 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-xs font-medium">Trusted by 500,000+ users worldwide</p>
          </div>

          {/* Pricing */}
          <div className="mb-5 rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-lg">{PRICING.trial.days}-Day Premium Trial</span>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300">
                Limited offer
              </Badge>
            </div>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-3xl font-extrabold text-primary">{PRICING.trial.label}</span>
              <span className="text-sm text-muted-foreground">today</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Then <strong>{PRICING.monthly.label}/month</strong> after {PRICING.trial.days} days. Cancel anytime.
            </p>
          </div>

          {/* Benefits */}
          <ul className="mb-5 space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                {b}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Button size="lg" className="w-full text-base" asChild>
            <Link href="/checkout">
              Start {PRICING.trial.days}-Day Trial — {PRICING.trial.label}
            </Link>
          </Button>

          {/* Security + legal */}
          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            <span>Secure payment · Renews at {PRICING.monthly.label}/mo · <Link href="/legal/subscription" className="underline">Terms</Link></span>
          </div>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            <button onClick={onClose} className="underline cursor-pointer">
              No thanks, I don't need to download
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
