import { DashboardShell } from "@/components/layout/DashboardShell";
import { Button } from "@/components/ui/button";
import {
  CreditCard, CheckCircle2, AlertTriangle, ExternalLink,
  Download, Shield, Clock, RefreshCw,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { PRICING } from "@/config/pricing";

export const metadata: Metadata = {
  title: "Billing – PDFCraft Dashboard",
  robots: { index: false, follow: false },
};

const mockUser = {
  name: "Alex Johnson",
  email: "agutierrezgomez00@gmail.com",
  subscriptionStatus: "trialing",
};

const mockInvoices = [
  { id: "INV-001", date: "01 Apr 2026", description: "PDFCraft 7-Day Trial",    amount: "0,50 €",  status: "paid" },
  { id: "INV-002", date: "08 Apr 2026", description: "PDFCraft Premium – April", amount: "49,90 €", status: "upcoming" },
];

const statusConfig = {
  active:   { label: "Active",    color: "bg-green-100 text-green-800",   dot: "bg-green-500" },
  trialing: { label: "Trial",     color: "bg-blue-100 text-blue-800",     dot: "bg-blue-500"  },
  past_due: { label: "Past due",  color: "bg-red-100 text-red-800",       dot: "bg-red-500"   },
  canceled: { label: "Cancelled", color: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
  free:     { label: "Free",      color: "bg-neutral-100 text-neutral-600", dot: "bg-neutral-400" },
};

export default function BillingPage() {
  const status = mockUser.subscriptionStatus as keyof typeof statusConfig;
  const cfg    = statusConfig[status] ?? statusConfig.free;

  return (
    <DashboardShell user={mockUser}>
      <div className="min-h-full">
        {/* Top bar */}
        <div className="flex items-center justify-between border-b px-8 py-5">
          <h1 className="text-xl font-bold text-neutral-900">Billing</h1>
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
                  {status === "trialing"
                    ? `Trial active — ends Apr 8, 2026. Then ${PRICING.monthly.label}/month.`
                    : status === "active"
                    ? `${PRICING.monthly.label}/month · Next renewal: May 8, 2026`
                    : "No active subscription"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-extrabold text-neutral-900">{PRICING.monthly.label}</p>
                <p className="text-xs text-neutral-400">per month</p>
              </div>
            </div>

            {status === "trialing" && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                <p className="text-sm text-blue-800">
                  Your trial ends on <strong>April 8, 2026</strong>. You will be charged{" "}
                  <strong>{PRICING.monthly.label}/month</strong> automatically unless you cancel before then.
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

            <div className="mt-5 flex flex-wrap gap-2">
              <Button className="gap-2 bg-neutral-900 hover:bg-neutral-800 text-white h-9 text-sm rounded-md" asChild>
                <Link href="/api/stripe/create-portal" target="_blank">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Manage subscription
                </Link>
              </Button>
              {status === "trialing" && (
                <Button variant="outline" className="gap-2 h-9 text-sm rounded-md border-red-200 text-red-600 hover:bg-red-50" asChild>
                  <Link href="/api/stripe/create-portal" target="_blank">
                    Cancel trial
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* ── Payment method ── */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
              <CreditCard className="h-4 w-4" /> Payment method
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-14 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                <CreditCard className="h-5 w-5 text-neutral-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">•••• •••• •••• 4242</p>
                <p className="text-xs text-neutral-500">Expires 12/2027</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto h-8 text-xs rounded-md">
                Update
              </Button>
            </div>
          </div>

          {/* ── Invoice history ── */}
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <div className="border-b border-neutral-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-700">Invoice history</h3>
            </div>
            <div className="divide-y divide-neutral-100">
              {mockInvoices.map((inv) => (
                <div key={inv.id} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-800">{inv.description}</p>
                    <p className="text-xs text-neutral-400">{inv.date} · {inv.id}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    inv.status === "paid"     ? "bg-green-100 text-green-700" :
                    inv.status === "upcoming" ? "bg-blue-100 text-blue-700"  :
                    "bg-neutral-100 text-neutral-500"
                  }`}>
                    {inv.status === "paid" ? "✓ Paid" : inv.status === "upcoming" ? "Upcoming" : inv.status}
                  </span>
                  <span className="text-sm font-bold text-neutral-900 w-20 text-right">{inv.amount}</span>
                  {inv.status === "paid" ? (
                    <button className="text-neutral-400 hover:text-neutral-700 transition-colors">
                      <Download className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="w-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ── Legal / Cancellation ── */}
          <div className="rounded-xl border border-neutral-100 bg-neutral-50 p-5 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Subscription terms</h3>
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
                <span>Cancel anytime before renewal from this page. No questions asked.</span>
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
