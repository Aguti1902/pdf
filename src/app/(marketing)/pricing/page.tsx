"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Lock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { PRICING, CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { CurrencySelector } from "@/components/checkout/CurrencySelector";
import { AuthModal }    from "@/components/auth/AuthModal";
import { PaywallModal } from "@/components/checkout/PaywallModal";

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span
          className={`text-base font-medium leading-snug ${open ? "text-primary" : "text-foreground"}`}
        >
          {question}
        </span>
        {open ? (
          <ChevronUp className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="ml-4 h-5 w-5 shrink-0 text-muted-foreground" />
        )}
      </button>
      {open && (
        <div className="pb-5 text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
          {answer}
        </div>
      )}
    </div>
  );
}

const checkFeats = ["feat1", "feat2", "feat3", "feat4", "feat5", "feat6"] as const;

const LOCALE_CURRENCY: Record<string, CurrencyCode> = {
  en: "USD", es: "EUR", fr: "EUR", de: "EUR", it: "EUR", uk: "EUR", ru: "EUR",
};

export default function PricingPage() {
  const { t, messages, locale } = useLanguage();
  const p = messages ? t("pricingPage") : null;
  const [currency,       setCurrency]       = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [checkoutLoading,setCheckoutLoading]= useState(false);
  const [showAuth,       setShowAuth]       = useState(false);
  const [showPaywall,    setShowPaywall]    = useState(false);
  const [userEmail,      setUserEmail]      = useState("");
  const [userName,       setUserName]       = useState("");
  const curr = CURRENCIES[currency];

  // Set default currency based on locale
  useEffect(() => {
    setCurrency(LOCALE_CURRENCY[locale] ?? DEFAULT_CURRENCY);
  }, [locale]);

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      // Check if user is already logged in
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          // Already logged in — check if already subscribed
          const subRes = await fetch("/api/subscription");
          const sub = subRes.ok ? await subRes.json() : {};
          if (sub.isPremium) {
            window.location.href = "/dashboard";
            return;
          }
          setUserEmail(data.user.email ?? "");
          setUserName(data.user.name   ?? "");
          setShowPaywall(true);
          return;
        }
      }
      // Not logged in → show auth modal
      setShowAuth(true);
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleAuthSuccess = async () => {
    setShowAuth(false);
    // After login, fetch user data then show paywall
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUserEmail(data.user?.email ?? "");
        setUserName(data.user?.name   ?? "");
      }
    } catch { /* ignore */ }
    setShowPaywall(true);
  };

  const tableRows = [
    { label: p?.row1Label ?? "Price and renewal", trial: p?.row1Trial ?? "0,50 € (Automatic renewal at 49,90 €/month)", monthly: p?.row1Monthly ?? "49,90 € per month", isText: true },
    { label: p?.row2Label ?? "Processed documents", trial: p?.row2Trial ?? "Maximum 3 documents per day", monthly: p?.row2Monthly ?? "Unlimited", isText: true },
    { label: p?.row3Label ?? "Storage", trial: p?.row3Trial ?? "Only for 24 hours", monthly: p?.row3Monthly ?? "Permanent storage", isText: true },
    { label: p?.row4Label ?? "Collaborators", trial: p?.row4Trial ?? "Not included", monthly: p?.row4Monthly ?? "Access for the entire team", isText: true },
    { label: p?.row5Label ?? "Editing and tools", trial: p?.row5Trial ?? "Full access with volume limitations", monthly: p?.row5Monthly ?? "Unlimited full access", isText: true },
  ];

  const faqs = [
    { q: p?.faq1Q ?? "", a: p?.faq1A ?? "" },
    { q: p?.faq2Q ?? "", a: p?.faq2A ?? "" },
    { q: p?.faq3Q ?? "", a: p?.faq3A ?? "" },
    { q: p?.faq4Q ?? "", a: p?.faq4A ?? "" },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      {/* Header */}
      <section className="py-14 text-center">
        <div className="container mx-auto max-w-2xl px-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            {p?.title ?? "Start your PDFCraft subscription"}
          </h1>
        </div>
      </section>

      {/* Pricing card */}
      <section className="pb-16">
        <div className="container mx-auto max-w-lg px-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Currency selector */}
            <div className="flex justify-center border-b border-border px-6 py-3">
              <CurrencySelector value={currency} onChange={setCurrency} />
            </div>

            {/* Today / Then columns */}
            <div className="grid grid-cols-2 divide-x divide-border px-0">
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
                {p?.disclosure ?? `By activating your 7 day trial for ${PRICING.trial.label}, you are starting a `}
                {!p && (
                  <>
                    <strong className="font-semibold text-foreground">recurring monthly subscription</strong>.{" "}
                    Once the trial period ends, you will be automatically charged the standard {PRICING.monthly.label} fee each month.
                  </>
                )}
              </p>
              {p && (
                <p className="mt-3 text-center text-sm leading-relaxed text-muted-foreground">
                  {p.disclosure2}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="border-t border-border px-6 pb-8 pt-5 text-center">
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading}
                className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-bold text-background transition hover:opacity-90 disabled:opacity-60"
              >
                <Lock className="h-4 w-4" />
                {checkoutLoading
                  ? (p?.redirecting ?? "Redirecting…")
                  : (p?.startBtn ?? `Start ${PRICING.trial.days}-day trial`)}
              </button>
              <p className="mt-3 text-xs text-muted-foreground underline-offset-2">
                <Link href="/dashboard" className="hover:underline">
                  {p?.cancelAnytime ?? "Cancel anytime"}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features & conditions table */}
      <section className="border-t py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-2xl font-extrabold tracking-tight text-foreground">
            {p?.featuresTitle ?? "Subscription features and conditions:"}
          </h2>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-4 text-left font-semibold text-foreground">
                    {p?.tableHeaderMain ?? "Main functions"}
                  </th>
                  <th className="px-5 py-4 text-center font-semibold text-foreground">
                    {p?.tableHeaderTrial ?? "7-day trial"}
                  </th>
                  <th className="px-5 py-4 text-center font-semibold text-foreground">
                    {p?.tableHeaderMonthly ?? "Monthly subscription"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tableRows.map((row) => (
                  <tr key={row.label} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{row.label}</td>
                    <td className="px-5 py-4 text-center text-muted-foreground">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: row.trial.replace(
                            /(\d+,?\d*\s*€[^)]*)/g,
                            (m) => `<strong class="text-foreground">${m}</strong>`
                          ),
                        }}
                      />
                    </td>
                    <td className="px-5 py-4 text-center font-semibold text-foreground">
                      {row.monthly}
                    </td>
                  </tr>
                ))}

                {/* Check rows */}
                {checkFeats.map((key) => (
                  <tr key={key} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">
                      {p?.[key] ?? key}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background">
                        <CheckCircle2 className="h-4 w-4" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t py-16">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="mb-10 text-center text-3xl font-extrabold tracking-tight text-foreground">
            {p?.faqTitle ?? "Frequently Asked Questions"}
          </h2>
          <div className="divide-y divide-border rounded-xl border border-border px-6">
            {faqs.map((faq, i) =>
              faq.q ? (
                <FaqItem key={i} question={faq.q} answer={faq.a} />
              ) : null
            )}
          </div>
        </div>
      </section>

      {/* Auth → Paywall flow */}
      <AuthModal
        open={showAuth}
        onClose={() => setShowAuth(false)}
        onSuccess={handleAuthSuccess}
      />
      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        userEmail={userEmail}
        userName={userName}
        toolName="PDFCraft Premium"
      />
    </div>
  );
}
