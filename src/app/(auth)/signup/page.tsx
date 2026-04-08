"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileText, Lock, Eye, EyeOff, Check } from "lucide-react";
import { signUpSchema, type SignUpInput } from "@/lib/validations";
import { toast } from "sonner";
import { SITE } from "@/config/seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { PaywallModal } from "@/components/checkout/PaywallModal";

function SignUpPageInner() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [payEmail,    setPayEmail]    = useState("");
  const [payName,     setPayName]     = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const { t, messages } = useLanguage();
  const s = messages ? t("signup") : null;

  const doRedirect = () => {
    if (redirectTo) router.push(redirectTo);
    else router.back();
  };

  const perksKeys = ["perk1", "perk2", "perk3"] as const;
  const defaultPerks = [
    "Free access to all PDF tools",
    "Try edit, sign, convert and more",
    "No credit card required to start",
  ];

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignUpInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");
      toast.success(`Welcome to ${SITE.name}!`);
      // New users never have a subscription — show paywall immediately
      setPayEmail(json.user?.email ?? data.email);
      setPayName(json.user?.name  ?? data.name ?? "");
      setShowPaywall(true);
      setLoading(false);
      return;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span className="gradient-text">{SITE.name}</span>
          </Link>

          <h1 className="mb-1 text-2xl font-bold">{s?.title ?? "Create your account"}</h1>
          <p className="mb-2 text-sm text-muted-foreground">
            {s?.subtitle ?? "Get started for free — no credit card required."}
          </p>
          <ul className="mb-6 space-y-1">
            {perksKeys.map((k, i) => (
              <li key={k} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-green-500" />
                {s?.[k] ?? defaultPerks[i]}
              </li>
            ))}
          </ul>

          <GoogleButton redirectTo={redirectTo || (typeof window !== "undefined" ? document.referrer || "/dashboard" : "/dashboard")} label="Continue with Google" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{s?.fullName ?? "Full Name"}</FormLabel>
                    <FormControl>
                      <Input placeholder="Alex Johnson" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{s?.email ?? "Email"}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{s?.password ?? "Password"}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Min. 8 characters"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (s?.creating ?? "Creating account...") : (s?.createBtn ?? "Create Free Account")}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {s?.terms ?? "By creating an account you agree to our"}{" "}
            <Link href="/legal/terms" className="underline">{s?.termsLink ?? "Terms"}</Link>{" "}
            {"and"}{" "}
            <Link href="/legal/privacy" className="underline">{s?.privacyLink ?? "Privacy Policy"}</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {s?.alreadyHave ?? "Already have an account?"}{" "}
            <Link href={redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : "/login"} className="font-medium text-primary hover:underline">
              {s?.signInLink ?? "Sign in"}
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>{s?.ssl ?? "Secured with 256-bit SSL encryption"}</span>
          </div>
        </div>
      </div>

      <div className="hidden flex-col items-center justify-center gradient-primary p-12 text-white lg:flex lg:w-2/5">
        <div className="max-w-xs text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold">{s?.sideTitle ?? "Start working with PDFs today"}</h2>
          <p className="text-sm opacity-80">
            {s?.sideSubtitle ?? `Join 500,000+ professionals who use ${SITE.name} to edit, sign, and convert PDFs daily.`}
          </p>
        </div>
      </div>
    </div>

    {showPaywall && (
      <PaywallModal
        open={showPaywall}
        onClose={doRedirect}
        onPaymentSuccess={doRedirect}
        userEmail={payEmail}
        userName={payName}
        hadSubscription={false}
        toolName="PDFCraft Premium"
      />
    )}
    </>
  );
}

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpPageInner />
    </Suspense>
  );
}
