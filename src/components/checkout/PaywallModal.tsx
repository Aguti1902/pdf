"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Loader2, X, ShieldCheck } from "lucide-react";
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
  const fetchedKey = useRef<string>("");

  useEffect(() => {
    setCurrency(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY);
  }, [locale]);

  const fetchClientSecret = useCallback(async (curr: CurrencyCode) => {
    const key = `${curr}|${userEmail ?? "guest"}`;
    if (fetchedKey.current === key) return;
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
      toast.error("No se pudo cargar el pago. Inténtalo de nuevo.");
      fetchedKey.current = "";
    } finally {
      setLoadingSecret(false);
    }
  }, [userEmail, userName]);

  useEffect(() => {
    if (!open) {
      setClientSecret(null);
      fetchedKey.current = "";
      return;
    }
    fetchClientSecret(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
        hideCloseButton
        className="max-w-md gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-2xl"
        aria-describedby={undefined}
      >
        <VisuallyHidden>
          <DialogTitle>Activar suscripción PDFCraft</DialogTitle>
        </VisuallyHidden>

        {/* Compact header: currency + close */}
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div className="flex items-center gap-3">
            <CurrencySelector value={currency} onChange={handleCurrencyChange} />
            {/* Inline price summary — very compact */}
            <span className="text-xs text-muted-foreground">
              <span className="font-bold text-foreground">{curr.trialLabel}</span>
              {" hoy · luego "}
              <span className="font-semibold text-foreground">{curr.monthlyLabel}/mes</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stripe embedded checkout — takes all the space */}
        <div className="min-h-[380px] w-full">
          {loadingSecret ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />
              <p className="text-sm">Cargando pago seguro…</p>
            </div>
          ) : clientSecret ? (
            <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          ) : (
            <div className="flex h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
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

        {/* Ultra-minimal fine print */}
        <div className="border-t border-border bg-muted/20 px-4 py-2 text-center">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3 w-3 text-green-500 shrink-0" />
            <p className="text-[10px] text-muted-foreground/60">
              Suscripción mensual recurrente. Cancela cuando quieras.{" "}
              <Link href="/legal/subscription" className="underline hover:text-foreground/60">Términos</Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
