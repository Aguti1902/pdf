"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
  PaymentRequestButtonElement,
} from "@stripe/react-stripe-js";
import {
  loadStripe,
  type PaymentRequest,
  type StripeCardNumberElementOptions,
  type PaymentRequestPaymentMethodEvent,
} from "@stripe/stripe-js";
import { Loader2, X, ShieldCheck, Lock, CreditCard, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CURRENCIES, DEFAULT_CURRENCY, PRICING, type CurrencyCode } from "@/config/pricing";
import { CurrencySelector } from "./CurrencySelector";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import Image from "next/image";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "");

/* ── Locale → default currency ─────────────────────────────────────── */
const LOCALE_CURRENCY: Record<string, CurrencyCode> = {
  en: "USD", es: "EUR", fr: "EUR", de: "EUR", it: "EUR", uk: "EUR", ru: "EUR",
};

/* ── Stripe element base style ──────────────────────────────────────── */
const ELEMENT_STYLE: StripeCardNumberElementOptions["style"] = {
  base: {
    fontSize: "15px",
    color: "#111827",
    fontFamily: "'Inter', sans-serif",
    "::placeholder": { color: "#9CA3AF" },
  },
  invalid: { color: "#EF4444" },
};

/* ══════════════════════════════════════════════════════════════════════
   Inner form — must be inside <Elements>
══════════════════════════════════════════════════════════════════════ */
interface FormProps {
  clientSecret: string;
  customerId: string;
  currency: CurrencyCode;
  userEmail?: string;
  onSuccess: () => void;
}

function CheckoutForm({ clientSecret, customerId, currency, userEmail, onSuccess }: FormProps) {
  const stripe   = useStripe();
  const elements = useElements();

  const [cardName,     setCardName]     = useState("");
  const [agreed,       setAgreed]       = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [payReq,       setPayReq]       = useState<PaymentRequest | null>(null);
  const [activeMethod, setActiveMethod] = useState<"card" | "wallet">("card");

  const curr = CURRENCIES[currency];

  /* ── Helper: activate subscription after successful payment ───────── */
  const activateSubscription = useCallback(async (pmId: string, piId: string) => {
    try {
      const res = await fetch("/api/stripe/activate-subscription", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ customerId, paymentMethodId: pmId, paymentIntentId: piId, currency }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess();
    } catch (err) {
      console.error(err);
      toast.info("Pago procesado. Activando acceso…");
      onSuccess();
    }
  }, [customerId, currency, onSuccess]);

  /* ── Google Pay / Apple Pay ────────────────────────────────────────── */
  useEffect(() => {
    if (!stripe) return;
    const pr = stripe.paymentRequest({
      country:           "ES",
      currency:          currency.toLowerCase(),
      total:             { label: `PDFCraft — ${PRICING.trial.days}-Day Trial`, amount: Math.round(curr.trialAmount * 100) },
      requestPayerName:  true,
      requestPayerEmail: true,
    });
    pr.canMakePayment().then(result => {
      if (result) setPayReq(pr);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stripe, currency, curr.trialAmount]);

  /* ── Google Pay paymentmethod event handler ───────────────────────── */
  useEffect(() => {
    if (!payReq || !stripe) return;

    const handler = async (ev: PaymentRequestPaymentMethodEvent) => {
      // Confirm the PaymentIntent with the wallet payment method
      const { paymentIntent, error: confirmError } = await stripe.confirmCardPayment(
        clientSecret,
        { payment_method: ev.paymentMethod.id },
        { handleActions: false },
      );

      if (confirmError) {
        ev.complete("fail");
        setError(confirmError.message ?? "El pago no pudo procesarse.");
        return;
      }

      ev.complete("success");

      // Handle 3DS / additional actions if required
      if (paymentIntent?.status === "requires_action") {
        const { error: actionError, paymentIntent: pi2 } = await stripe.confirmCardPayment(clientSecret);
        if (actionError) { setError(actionError.message ?? "Autenticación fallida."); return; }
        if (pi2?.payment_method) await activateSubscription(pi2.payment_method as string, pi2.id);
      } else if (paymentIntent?.status === "succeeded" && paymentIntent.payment_method) {
        await activateSubscription(paymentIntent.payment_method as string, paymentIntent.id);
      }
    };

    payReq.on("paymentmethod", handler);
    return () => { payReq.off("paymentmethod", handler); };
  }, [payReq, stripe, clientSecret, activateSubscription]);

  /* ── Card submit ──────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (!agreed) { setError("Debes aceptar los términos para continuar."); return; }
    if (!cardName.trim()) { setError("Introduce el nombre del titular."); return; }

    setError("");
    setLoading(true);

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) { setLoading(false); return; }

    const { paymentIntent, error: piError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card:            cardNumber,
        billing_details: { name: cardName, email: userEmail },
      },
    });

    if (piError) {
      setError(piError.message ?? "El pago no pudo procesarse.");
      setLoading(false);
      return;
    }

    if (paymentIntent?.status !== "succeeded") {
      setError("El pago no se completó. Inténtalo de nuevo.");
      setLoading(false);
      return;
    }

    await activateSubscription(paymentIntent.payment_method as string, paymentIntent.id);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {/* Payment method tabs — only show wallet tab when available */}
      {payReq && (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setActiveMethod("card")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
              activeMethod === "card"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Tarjeta
          </button>
          <button
            type="button"
            onClick={() => setActiveMethod("wallet")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 py-2.5 text-sm font-medium transition-all ${
              activeMethod === "wallet"
                ? "border-primary bg-primary/5 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            <svg className="h-5" viewBox="0 0 41 17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19.44 8.49c0 2.37-1.83 4.1-4.08 4.1s-4.08-1.73-4.08-4.1c0-2.39 1.83-4.1 4.08-4.1s4.08 1.71 4.08 4.1zm-1.79 0c0-1.49-1.08-2.5-2.29-2.5s-2.29 1.01-2.29 2.5c0 1.47 1.08 2.5 2.29 2.5s2.29-1.01 2.29-2.5z" fill="#EA4335"/>
              <path d="M28.17 8.49c0 2.37-1.83 4.1-4.08 4.1s-4.08-1.73-4.08-4.1c0-2.38 1.83-4.1 4.08-4.1s4.08 1.71 4.08 4.1zm-1.79 0c0-1.49-1.08-2.5-2.29-2.5s-2.29 1.01-2.29 2.5c0 1.47 1.08 2.5 2.29 2.5s2.29-1.01 2.29-2.5z" fill="#FBBC05"/>
              <path d="M36.65 4.63v7.48c0 3.07-1.81 4.33-3.95 4.33-2.02 0-3.23-1.35-3.69-2.46l1.56-.65c.28.68.97 1.48 2.13 1.48 1.39 0 2.26-.86 2.26-2.48v-.61h-.06c-.42.52-1.22.97-2.23.97-2.12 0-4.06-1.85-4.06-4.22 0-2.39 1.94-4.18 4.06-4.18 1.01 0 1.81.44 2.23.94h.06v-.6h1.69zm-1.56 3.88c0-1.49-.99-2.57-2.26-2.57-1.28 0-2.36 1.08-2.36 2.57 0 1.47 1.08 2.52 2.36 2.52 1.27 0 2.26-1.05 2.26-2.52z" fill="#4285F4"/>
              <path d="M39.67.96v11.55h-1.78V.96h1.78z" fill="#34A853"/>
              <path d="M6.48 7.6V5.92h5.84c.06.3.09.65.09 1.03 0 1.28-.35 2.86-1.48 3.99-1.1 1.14-2.5 1.74-4.44 1.74C2.87 12.68 0 9.87 0 6.25S2.87-.17 6.49-.17c1.99 0 3.41.78 4.47 1.79L9.7 2.87c-.76-.71-1.79-1.27-3.21-1.27-2.62 0-4.68 2.11-4.68 4.73 0 2.62 2.06 4.73 4.68 4.73 1.7 0 2.67-.68 3.29-1.3.5-.5.84-1.23.97-2.22H6.48z" fill="#4285F4"/>
            </svg>
            Google Pay
          </button>
        </div>
      )}

      {/* ── Wallet (Google Pay / Apple Pay) ─────────────────────────── */}
      {activeMethod === "wallet" && payReq ? (
        <>
          <p className="text-center text-xs text-muted-foreground">
            Acepta una prueba de {PRICING.trial.days} días ({curr.trialLabel}), luego {curr.monthlyLabel}/mes.
            Puedes cancelar cuando quieras.
          </p>
          <PaymentRequestButtonElement
            options={{ paymentRequest: payReq, style: { paymentRequestButton: { height: "52px", theme: "dark" } } }}
          />
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}
          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            Pago seguro SSL · Cancela cuando quieras
          </div>
        </>
      ) : (
        <>
          {/* Card number */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Número de tarjeta
            </label>
            <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
              <div className="flex-1">
                <CardNumberElement options={{ style: ELEMENT_STYLE, showIcon: true }} />
              </div>
            </div>
          </div>

          {/* Expiry + CVC */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Fecha de caducidad
              </label>
              <div className="rounded-lg border border-border bg-background px-3 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
                <CardExpiryElement options={{ style: ELEMENT_STYLE }} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
                CVC
              </label>
              <div className="rounded-lg border border-border bg-background px-3 py-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30">
                <CardCvcElement options={{ style: ELEMENT_STYLE }} />
              </div>
            </div>
          </div>

          {/* Card holder name */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Nombre del titular
            </label>
            <input
              type="text"
              value={cardName}
              onChange={e => setCardName(e.target.value)}
              placeholder="Nombre completo"
              className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/30"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          {/* Terms checkbox */}
          <label className="flex cursor-pointer items-start gap-2.5">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-primary"
            />
            <span className="text-[11px] leading-relaxed text-muted-foreground">
              Al marcar esta casilla, aceptas una prueba de {PRICING.trial.days} días ({curr.trialLabel}) y
              una suscripción mensual posterior de {curr.monthlyLabel}. Autorizas los cargos recurrentes y
              puedes cancelar en cualquier momento.{" "}
              <Link href="/legal/subscription" className="text-primary underline" target="_blank">
                Términos
              </Link>{" "}
              y{" "}
              <Link href="/legal/privacy" className="text-primary underline" target="_blank">
                Privacidad
              </Link>.
            </span>
          </label>

          {/* CTA */}
          <button
            type="submit"
            disabled={loading || !stripe}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-base font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</>
            ) : (
              <><Lock className="h-4 w-4" /> Comenzar prueba</>
            )}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
            Pago seguro SSL · Cancela cuando quieras
          </div>
        </>
      )}
    </form>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Success screen
══════════════════════════════════════════════════════════════════════ */
function SuccessScreen() {
  useEffect(() => {
    const t = setTimeout(() => { window.location.href = "/dashboard?checkout=success"; }, 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h3 className="text-xl font-bold">¡Suscripción activada!</h3>
      <p className="text-sm text-muted-foreground">Redirigiendo a tu dashboard…</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   Main PaywallModal
══════════════════════════════════════════════════════════════════════ */
interface PaywallModalProps {
  open: boolean;
  onClose: () => void;
  toolName?: string;
  userEmail?: string;
  userName?: string;
  /** Called immediately after payment succeeds, before the success screen redirect */
  onPaymentSuccess?: () => void;
}

export function PaywallModal({ open, onClose, toolName, userEmail, userName, onPaymentSuccess }: PaywallModalProps) {
  const { locale } = useLanguage();
  const defaultCurrency: CurrencyCode = LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY;

  const [currency,     setCurrency]    = useState<CurrencyCode>(defaultCurrency);
  const [clientSecret, setSecret]      = useState<string | null>(null);
  const [customerId,   setCustomerId]  = useState<string>("");
  const [loading,      setLoading]     = useState(false);
  const [success,      setSuccess]     = useState(false);
  const fetchedKey = useRef("");

  // Sync currency with locale
  useEffect(() => { setCurrency(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY); }, [locale]);

  const fetchIntent = useCallback(async (curr: CurrencyCode, existingCustomerId?: string) => {
    const key = `${curr}|${userEmail ?? "guest"}`;
    if (fetchedKey.current === key) return;
    fetchedKey.current = key;
    setLoading(true);
    setSecret(null);
    try {
      const res = await fetch("/api/stripe/create-trial-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          userEmail,
          userName,
          currency: curr,
          // Reuse existing customer to avoid duplicates on currency change
          ...(existingCustomerId && { customerId: existingCustomerId }),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "checkout_failed");
      setSecret(data.clientSecret);
      setCustomerId(data.customerId);
    } catch (err) {
      console.error(err);
      toast.error("No se pudo cargar el formulario de pago. Inténtalo de nuevo.");
      fetchedKey.current = "";
    } finally {
      setLoading(false);
    }
  }, [userEmail, userName]);

  // Fetch on open
  useEffect(() => {
    if (!open) { setSecret(null); setSuccess(false); fetchedKey.current = ""; return; }
    fetchIntent(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleCurrencyChange = (c: CurrencyCode) => {
    setCurrency(c);
    fetchedKey.current = "";
    // Pass existing customerId to avoid creating a new Stripe customer on every currency switch
    fetchIntent(c, customerId || undefined);
  };

  const curr = CURRENCIES[currency];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideCloseButton
        aria-describedby={undefined}
        className="max-w-2xl gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-2xl"
      >
        <VisuallyHidden>
          <DialogTitle>Activar suscripción PDFCraft</DialogTitle>
        </VisuallyHidden>

        <div className="flex min-h-[520px]">

          {/* ── Left panel: product preview ─────────────────────────── */}
          <div className="hidden w-56 shrink-0 flex-col items-center justify-center gap-5 border-r border-border bg-gradient-to-b from-primary/5 to-primary/10 px-6 py-8 sm:flex">
            {/* PDF icon + glow */}
            <div className="relative flex h-28 w-24 flex-col overflow-hidden rounded-xl border border-primary/20 bg-white shadow-xl">
              <div className="flex h-6 items-center justify-center bg-primary/90">
                <span className="text-[9px] font-bold uppercase tracking-widest text-white">PDF</span>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-2.5">
                {[70, 90, 55, 80, 60, 40].map((w, i) => (
                  <div key={i} className="rounded-full bg-primary/15" style={{ height: 4, width: `${w}%` }} />
                ))}
              </div>
              <div className="absolute -right-3 -top-3 h-10 w-10 rounded-full bg-green-400/20 blur-xl" />
            </div>

            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-primary">PDFCraft</p>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {toolName ? `Acceso completo a ${toolName}` : "Acceso completo a todas las herramientas PDF"}
              </p>
            </div>

            {/* Feature list */}
            <ul className="w-full space-y-1.5">
              {["Editar y anotar PDFs", "Convertir a Word, JPG…", "Fusionar y dividir", "Sin marcas de agua"].map(f => (
                <li key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Right panel: checkout form ───────────────────────────── */}
          <div className="flex flex-1 flex-col">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <p className="text-xs text-muted-foreground">Tu documento está listo</p>
                <p className="text-base font-bold leading-tight">Inicia tu suscripción para acceder</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Price summary + currency */}
            <div className="flex items-center justify-between border-b border-border px-6 py-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Total hoy</p>
                <p className="text-xs text-muted-foreground">
                  Prueba {PRICING.trial.days} días, luego {curr.monthlyLabel}/mes
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-extrabold">{curr.trialLabel}</span>
                <CurrencySelector value={currency} onChange={handleCurrencyChange} />
              </div>
            </div>

            {/* Form body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {success ? (
                <SuccessScreen />
              ) : loading || !clientSecret ? (
                <div className="flex h-48 flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-7 w-7 animate-spin text-primary" />
                  <p className="text-sm">Preparando el formulario de pago…</p>
                </div>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret, locale: locale as "es" | "en" | "fr" | "de" | "it" | "auto" }}>
                  <CheckoutForm
                    clientSecret={clientSecret}
                    customerId={customerId}
                    currency={currency}
                    userEmail={userEmail}
                    onSuccess={() => { onPaymentSuccess?.(); setSuccess(true); }}
                  />
                </Elements>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
