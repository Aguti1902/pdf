"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  CreditCard, CheckCircle2, AlertTriangle, ExternalLink,
  Download, Shield, Clock, RefreshCw, Loader2,
} from "lucide-react";
import Link from "next/link";
import { PRICING } from "@/config/pricing";
import { useLanguage } from "@/contexts/LanguageContext";

interface UserData {
  id: string; email: string; name: string | null;
  subscription?: {
    status: string;
    trialEnd: string | null;
    stripeCurrentPeriodEnd: string;
    stripeCancelAtPeriodEnd: boolean;
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  active:   { label: "Active",    color: "bg-green-100 text-green-800",     dot: "bg-green-500"   },
  trialing: { label: "Trial",     color: "bg-blue-100 text-blue-800",       dot: "bg-blue-500"    },
  past_due: { label: "Past due",  color: "bg-red-100 text-red-800",         dot: "bg-red-500"     },
  canceled: { label: "Cancelled", color: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
  free:     { label: "Free",      color: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
};

export default function BillingPage() {
  const [user,    setUser]    = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, messages } = useLanguage();
  const d = messages ? t("dashboard") : null;

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.user) setUser(data.user); })
      .finally(() => setLoading(false));
  }, []);

  const sub    = user?.subscription;
  const status = (sub?.status ?? "free") as keyof typeof STATUS_CONFIG;
  const cfg    = STATUS_CONFIG[status] ?? STATUS_CONFIG.free;

  const periodEnd = sub?.stripeCurrentPeriodEnd
    ? new Date(sub.stripeCurrentPeriodEnd).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })
    : null;
  const trialEndDate = sub?.trialEnd
    ? new Date(sub.trialEnd).toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" })
    : null;

  if (loading) return (
    <DashboardShell>
      <div className="flex items-center justify-center h-64 text-neutral-400">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        {d?.loading ?? "Loading..."}
      </div>
    </DashboardShell>
  );

  return (
    <DashboardShell user={user ?? undefined}>
      <div className="min-h-full">
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">{d?.billing ?? "Billing"}</h1>
        </div>

        <div className="px-8 py-6 space-y-6 max-w-3xl">

          {/* ── Subscription card ── */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-neutral-900">PDFCraft Premium</h2>
                <p className="text-sm text-neutral-500 mt-0.5">
                  {status === "trialing" && trialEndDate
                    ? `${d?.trialActiveMsg ?? "Trial active"} — ends ${trialEndDate}. ${d?.thenPerMonth?.replace("{price}", PRICING.monthly.label) ?? `Then ${PRICING.monthly.label}/month.`}`
                    : status === "active" && periodEnd
                    ? `${PRICING.monthly.label}/month · Next renewal: ${periodEnd}`
                    : (d?.noActivePlan ?? "No active subscription")}
                </p>
              </div>
              {sub && (
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-neutral-900">{PRICING.monthly.label}</p>
                  <p className="text-xs text-neutral-400">{d?.perMonth ?? "per month"}</p>
                </div>
              )}
            </div>

            {status === "trialing" && trialEndDate && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  {d?.trialWarning?.replace("{price}", PRICING.monthly.label) ??
                    `Your trial ends on ${trialEndDate}. You will be charged ${PRICING.monthly.label}/month automatically unless you cancel before then.`}
                </p>
              </div>
            )}

            {status === "past_due" && (
              <div className="mt-4 rounded-lg border border-red-100 bg-red-50 p-3 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600 shrink-0" />
                <p className="text-sm text-red-800">
                  Your last payment failed. Please update your payment method to keep access.
                </p>
              </div>
            )}

            {sub && (
              <div className="mt-5 flex flex-wrap gap-2">
                <Button className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white h-9 text-sm rounded-md" asChild>
                  <Link href="/api/stripe/create-portal" target="_blank">
                    <ExternalLink className="h-3.5 w-3.5" />
                    {d?.manageSubscription ?? "Manage subscription"}
                  </Link>
                </Button>
                {status === "trialing" && (
                  <Button variant="outline" className="gap-2 h-9 text-sm rounded-md border-red-200 text-red-600 hover:bg-red-50" asChild>
                    <Link href="/api/stripe/create-portal" target="_blank">
                      {d?.cancelTrial ?? "Cancel trial"}
                    </Link>
                  </Button>
                )}
              </div>
            )}

            {!sub && (
              <div className="mt-5">
                <Button className="gap-2 bg-primary hover:bg-primary/90 text-white h-9 text-sm rounded-md" asChild>
                  <Link href="/pricing">
                    {d?.upgradeBtn ?? "Upgrade now"}
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* ── Payment method ── */}
          {sub && (
            <div className="rounded-xl border border-neutral-200 bg-white p-6">
              <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" /> {d?.paymentMethod ?? "Payment method"}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                  <CreditCard className="h-5 w-5 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">•••• •••• •••• ••••</p>
                  <p className="text-xs text-neutral-500 italic">
                    Manage via Stripe portal
                  </p>
                </div>
                <Button variant="outline" size="sm" className="ml-auto h-8 text-xs rounded-md" asChild>
                  <Link href="/api/stripe/create-portal" target="_blank">
                    {d?.updatePayment ?? "Update"}
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {/* ── Legal ── */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              {d?.subscriptionTerms ?? "Subscription terms"}
            </h3>
            <div className="space-y-2 text-xs text-neutral-500 leading-relaxed">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
                <span>Your trial costs <strong className="text-neutral-700">0,50 €</strong> and gives 7 days of full access.</span>
              </div>
              <div className="flex items-start gap-2">
                <RefreshCw className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
                <span>After the trial, your subscription automatically renews at <strong className="text-neutral-700">{PRICING.monthly.label}/month</strong> until cancelled.</span>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
                <span>{d?.cancelPolicy ?? "Cancel anytime before renewal from this page. No questions asked."}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Link href="/legal/subscription" className="text-xs text-neutral-500 underline hover:text-neutral-800">Subscription policy</Link>
              <Link href="/legal/refund"       className="text-xs text-neutral-500 underline hover:text-neutral-800">Refund policy</Link>
              <Link href="/legal/terms"        className="text-xs text-neutral-500 underline hover:text-neutral-800">Terms of service</Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
