import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  CreditCard,
  Shield,
  Download,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Billing – DocForge Dashboard",
  robots: { index: false, follow: false },
};

const mockUser = {
  name: "Alex Johnson",
  email: "alex@example.com",
  subscriptionStatus: "trialing" as const,
};

const mockInvoices = [
  { id: "inv_001", date: "Apr 1, 2026", amount: "$0.99", status: "paid", description: "Trial — DocForge Premium" },
];

export default function BillingPage() {
  return (
    <DashboardShell user={mockUser}>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your subscription, payment method, and invoices.
          </p>
        </div>

        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-lg">DocForge Premium</span>
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Trial
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Trial period · Full access to all features
                </p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Trial started</p>
                <p className="font-medium">Apr 1, 2026</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trial ends</p>
                <p className="font-medium">Apr 8, 2026</p>
              </div>
              <div>
                <p className="text-muted-foreground">Next billing date</p>
                <p className="font-medium">Apr 8, 2026</p>
              </div>
              <div>
                <p className="text-muted-foreground">Renewal amount</p>
                <p className="font-semibold text-primary">$9.99/month</p>
              </div>
            </div>

            {/* Important notice */}
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
              <div className="flex gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <p>
                  Your trial ends on <strong>Apr 8, 2026</strong>. Your card will
                  be automatically charged <strong>$9.99</strong> on that date
                  unless you cancel before. Cancel anytime below — no questions asked.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="/api/stripe/create-portal" className="gap-1.5">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Manage via Stripe
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment method */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Method</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-14 items-center justify-center rounded-lg border bg-muted">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">•••• •••• •••• 4242</p>
                <p className="text-xs text-muted-foreground">Expires 12/27</p>
              </div>
              <Button variant="outline" size="sm" className="ml-auto" asChild>
                <a href="/api/stripe/create-portal">Update</a>
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Shield className="h-3.5 w-3.5" />
              <span>Payment data secured by Stripe. We never store your card details.</span>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoice History</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {mockInvoices.length > 0 ? (
              <div className="divide-y">
                {mockInvoices.map((inv) => (
                  <div key={inv.id} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{inv.description}</p>
                      <p className="text-xs text-muted-foreground">{inv.date}</p>
                    </div>
                    <span className="text-sm font-semibold">{inv.amount}</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                    >
                      {inv.status}
                    </Badge>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No invoices yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cancel subscription */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Cancel Subscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Cancelling stops future renewals. You keep full access until{" "}
              <strong>Apr 8, 2026</strong>. Your data is not deleted.
            </p>
            <AlertDialog>
              <AlertDialogTrigger>
                <span className="inline-flex h-8 items-center justify-center rounded-md border border-destructive/50 bg-background px-3 text-xs font-medium text-destructive hover:bg-destructive/5 cursor-pointer transition-colors">
                  Cancel Subscription
                </span>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                  <AlertDialogDescription>
                    You will keep Premium access until <strong>Apr 8, 2026</strong>.
                    After that, your account will revert to the free plan.
                    You can resubscribe at any time.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Yes, Cancel
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground">
              Need help?{" "}
              <Link href="/contact" className="underline">
                Contact support
              </Link>
              {" "}or see our{" "}
              <Link href="/legal/refund" className="underline">
                Refund Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
