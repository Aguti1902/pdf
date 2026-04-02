"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Lock,
  Check,
  Star,
  ChevronRight,
  CreditCard,
  AlertCircle,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { PRICING, TRIAL_DISCLOSURE, FEATURES } from "@/config/pricing";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations";
import { toast } from "sonner";
import { Header } from "@/components/layout/Header";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponValue, setCouponValue] = useState("");

  const form = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { acceptTerms: false, couponCode: "" },
  });

  const onSubmit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: PRICING.trial.stripePriceId,
          couponCode: couponApplied ? couponValue : undefined,
        }),
      });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      window.location.href = url;
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-muted/20 py-10">
        <div className="container mx-auto max-w-5xl px-4">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">Checkout</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left — Order Summary */}
            <div className="order-2 lg:order-1">
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-bold">Order Summary</h2>
                </div>

                {/* Stars */}
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
                  <div className="flex shrink-0">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs font-medium">Trusted by 500,000+ users</p>
                </div>

                {/* Plan */}
                <div className="mb-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <p className="font-bold">PDFCraft Premium</p>
                      <p className="text-xs text-muted-foreground">{PRICING.trial.days}-Day Full Access Trial</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Best value
                    </Badge>
                  </div>
                </div>

                {/* Features */}
                <ul className="mb-5 space-y-1.5">
                  {FEATURES.premium.slice(0, 6).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Separator className="my-4" />

                {/* Price breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{PRICING.trial.days}-day trial</span>
                    <span className="font-medium">{PRICING.trial.label}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon applied</span>
                      <span>— discount</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-bold text-base">
                    <span>Due today</span>
                    <span className="text-primary">{PRICING.trial.label}</span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>After {PRICING.trial.days} days</span>
                    <span className="font-medium">{PRICING.monthly.label}/month</span>
                  </div>
                </div>

                {/* Renewal warning */}
                <div className="mt-4 flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>{TRIAL_DISCLOSURE.summary}</p>
                </div>
              </div>
            </div>

            {/* Right — Payment */}
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl border bg-card p-6 shadow-sm">
                <div className="mb-5 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-green-500" />
                  <h2 className="text-lg font-bold">Secure Checkout</h2>
                  <Badge variant="secondary" className="ml-auto text-xs">SSL Encrypted</Badge>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    {/* Coupon */}
                    <div>
                      <p className="mb-2 text-sm font-medium">Coupon Code (optional)</p>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon"
                          value={couponValue}
                          onChange={(e) => setCouponValue(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (couponValue) {
                              setCouponApplied(true);
                              toast.success("Coupon applied!");
                            }
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>

                    <Separator />

                    {/* Stripe redirect notice */}
                    <div className="rounded-xl border-2 border-dashed bg-muted/30 p-4 text-center">
                      <CreditCard className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Secure payment via Stripe</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Card · Google Pay · Apple Pay accepted
                      </p>
                    </div>

                    {/* Legal checkbox */}
                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="mt-0.5"
                            />
                          </FormControl>
                          <div>
                            <FormLabel className="text-xs font-normal leading-relaxed cursor-pointer">
                              {TRIAL_DISCLOSURE.checkoutNotice}{" "}
                              I agree to the{" "}
                              <Link href="/legal/terms" className="underline text-primary" target="_blank">Terms</Link>,{" "}
                              <Link href="/legal/subscription" className="underline text-primary" target="_blank">Subscription Terms</Link>{" "}
                              and{" "}
                              <Link href="/legal/privacy" className="underline text-primary" target="_blank">Privacy Policy</Link>.
                            </FormLabel>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-base font-bold"
                      disabled={loading}
                    >
                      {loading ? "Redirecting..." : (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          Pay {PRICING.trial.label} — Start Trial
                        </>
                      )}
                    </Button>

                    {/* Post-trial price — always visible */}
                    <div className="rounded-lg border bg-amber-50/50 p-3 text-xs text-center dark:bg-amber-900/10">
                      <p className="font-medium">After {PRICING.trial.days} days → <strong>{PRICING.monthly.label}/month</strong></p>
                      <p className="text-muted-foreground mt-0.5">
                        Cancel before trial ends at <Link href="/dashboard/billing" className="underline">Account → Billing</Link>
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <div className="flex items-center gap-1">
                        <Shield className="h-3.5 w-3.5" />
                        <span>256-bit SSL</span>
                      </div>
                      <span>·</span>
                      <span>Powered by Stripe</span>
                      <span>·</span>
                      <span>Cancel anytime</span>
                    </div>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
