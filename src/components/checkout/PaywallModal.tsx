"use client";

import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
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

/** Map locale codes to a preferred default currency */
const LOCALE_CURRENCY: Record<string, CurrencyCode> = {
  en: "USD",
  es: "EUR",
  fr: "EUR",
  de: "EUR",
  it: "EUR",
  uk: "EUR",
  ru: "EUR",
};

export function PaywallModal({ open, onClose, toolName: _toolName, userEmail, userName }: PaywallModalProps) {
  const { locale } = useLanguage();
  const defaultCurrency: CurrencyCode = LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY;

  const [loading, setLoading]   = useState(false);
  const [currency, setCurrency] = useState<CurrencyCode>(defaultCurrency);
  const didAutoLaunch = useRef(false);

  // Sync currency when locale changes
  useEffect(() => {
    setCurrency(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY);
  }, [locale]);

  const curr = CURRENCIES[currency];

  const handleCheckout = async (selectedCurrency = currency) => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId:   PRICING.monthly.stripePriceId,
          userEmail,
          userName,
          currency:  selectedCurrency,
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

  // Auto-launch checkout the first time the modal opens
  useEffect(() => {
    if (open && !didAutoLaunch.current) {
      didAutoLaunch.current = true;
      // Small delay so the modal renders before we navigate
      const t = setTimeout(() => handleCheckout(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY), 400);
      return () => clearTimeout(t);
    }
    if (!open) {
      didAutoLaunch.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-xl">

        {/* Currency selector */}
        <div className="flex justify-center border-b border-border px-6 py-3">
          <CurrencySelector value={currency} onChange={setCurrency} />
        </div>

        {/* Price columns */}
        <div className="grid grid-cols-2 divide-x divide-border">
          <div className="flex flex-col items-center px-5 py-7">
            <p className="mb-1.5 text-sm font-semibold text-muted-foreground">Hoy</p>
            <p className="text-4xl font-extrabold tracking-tight text-foreground">{curr.trialLabel}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">Prueba de {PRICING.trial.days} días</p>
          </div>
          <div className="flex flex-col items-center px-5 py-7">
            <p className="mb-1.5 text-sm font-semibold text-muted-foreground">Luego</p>
            <p className="text-4xl font-extrabold tracking-tight text-foreground">{curr.monthlyLabel}</p>
            <p className="mt-1.5 text-xs text-muted-foreground">/ mes</p>
          </div>
        </div>

        {/* CTA — loading state while auto-redirecting */}
        <div className="border-t border-border px-5 pb-5 pt-4">
          <button
            onClick={() => handleCheckout()}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-foreground px-4 py-3.5 text-base font-bold text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Redirigiendo al pago…
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Iniciar prueba de {PRICING.trial.days} días
              </>
            )}
          </button>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            Pago seguro · Cancela cuando quieras
          </div>
        </div>

        {/* Subscription fine print — minimal and discreet */}
        <div className="border-t border-border bg-muted/20 px-5 py-2.5 text-center">
          <p className="text-[10px] leading-relaxed text-muted-foreground/70">
            Al continuar inicias una suscripción mensual recurrente de {curr.monthlyLabel}/mes tras el período de prueba.{" "}
            <Link href="/legal/subscription" className="underline underline-offset-2 hover:text-foreground/70">
              Ver términos
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
