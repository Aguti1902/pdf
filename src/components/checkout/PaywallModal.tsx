"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { loadStripe } from "@stripe/stripe-js";
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from "@stripe/react-stripe-js";
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { CurrencySelector } from "./CurrencySelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
  userEmail?: string;
  userName?: string;
}

const LOCALE_CURRENCY: Record<string, CurrencyCode> = {
  en: "USD", es: "EUR", fr: "EUR", de: "EUR", it: "EUR", uk: "EUR", ru: "EUR",
};

export function PaywallModal({ open, onClose, toolName: _toolName, userEmail, userName }: PaywallModalProps) {
  const { locale } = useLanguage();
  const defaultCurrency: CurrencyCode = LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY;

  const [currency, setCurrency]           = useState<CurrencyCode>(defaultCurrency);
  const [clientSecret, setClientSecret]   = useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const fetchedKey = useRef<string>("");  // tracks last fetched currency to avoid duplicate calls

  // Sync default currency to locale
  useEffect(() => {
    setCurrency(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY);
  }, [locale]);

  const fetchClientSecret = useCallback(async (curr: CurrencyCode) => {
    const key = `${curr}|${userEmail}`;
    if (fetchedKey.current === key) return; // already fetched for this combination
    fetchedKey.current = key;
    setLoadingSecret(true);
    setClientSecret(null);
    try {
      const res = await fetch("/api/stripe/create-embedded-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userEmail, userName, currency: curr }),
      });
      if (!res.ok) throw new Error("checkout_create_failed");
      const { clientSecret: cs, error } = await res.json();
      if (error) throw new Error(error);
      setClientSecret(cs);
    } catch (err) {
      console.error(err);
      toast.error("Could not load checkout. Please try again.");
      fetchedKey.current = ""; // allow retry
    } finally {
      setLoadingSecret(false);
    }
  }, [userEmail, userName]);

  // Fetch session when modal opens or currency changes
  useEffect(() => {
    if (!open) {
      // Reset on close so next open creates a fresh session
      setClientSecret(null);
      fetchedKey.current = "";
      return;
    }
    fetchClientSecret(currency);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // When currency changes after modal is open, reset and fetch new session
  const handleCurrencyChange = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency);
    fetchedKey.current = "";
    setClientSecret(null);
    fetchClientSecret(newCurrency);
  };

  const curr = CURRENCIES[currency];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-md gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-2xl"
        // Remove default close button so we can place our own
        hideCloseButton
      >
        {/* Header row: currency selector + close */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <CurrencySelector value={currency} onChange={handleCurrencyChange} />
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Price summary strip */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
          <div className="flex flex-col items-center px-5 py-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Hoy</p>
            <p className="text-3xl font-extrabold tracking-tight">{curr.trialLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">Prueba 2 días</p>
          </div>
          <div className="flex flex-col items-center px-5 py-5">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Luego</p>
            <p className="text-3xl font-extrabold tracking-tight">{curr.monthlyLabel}</p>
            <p className="mt-1 text-xs text-muted-foreground">/ mes</p>
          </div>
        </div>

        {/* Embedded Stripe checkout */}
        <div className="min-h-[300px]">
          {loadingSecret ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm">Cargando pago seguro…</p>
            </div>
          ) : clientSecret ? (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout className="w-full" />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
              <p className="text-sm">No se pudo cargar el formulario de pago.</p>
              <button
                className="text-xs underline hover:text-foreground"
                onClick={() => { fetchedKey.current = ""; fetchClientSecret(currency); }}
              >
                Reintentar
              </button>
            </div>
          )}
        </div>

        {/* Fine print */}
        <div className="border-t border-border bg-muted/20 px-5 py-2.5 text-center">
          <p className="text-[10px] leading-relaxed text-muted-foreground/60">
            Suscripción mensual recurrente de {curr.monthlyLabel}/mes tras la prueba.{" "}
            <Link href="/legal/subscription" className="underline underline-offset-2 hover:text-foreground/60">
              Ver términos
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
