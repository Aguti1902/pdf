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
import { FileText, Lock, Eye, EyeOff } from "lucide-react";
import { signInSchema, type SignInInput } from "@/lib/validations";
import { toast } from "sonner";
import { SITE } from "@/config/seo";
import { useLanguage } from "@/contexts/LanguageContext";
import { GoogleButton } from "@/components/auth/GoogleButton";

function LoginPageInner() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const { t, messages } = useLanguage();
  const l = messages ? t("login") : null;

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      toast.success("Signed in successfully!");
      if (redirectTo) router.push(redirectTo);
      else router.back();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const defaultFeats = [
    "21+ professional PDF tools",
    "Unlimited downloads with Premium",
    "Secure & private — files auto-deleted",
    "Works on any device, any browser",
  ];
  const featKeys = ["feat1", "feat2", "feat3", "feat4"] as const;

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span className="gradient-text">{SITE.name}</span>
          </Link>

          <h1 className="mb-1 text-2xl font-bold">{l?.title ?? "Welcome back"}</h1>
          <p className="mb-7 text-sm text-muted-foreground">
            {l?.subtitle ?? "Sign in to your account to continue."}
          </p>

          <GoogleButton redirectTo={redirectTo || (typeof window !== "undefined" ? document.referrer || "/dashboard" : "/dashboard")} />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{l?.email ?? "Email"}</FormLabel>
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
                    <div className="flex items-center justify-between">
                      <FormLabel>{l?.password ?? "Password"}</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        {l?.forgotPassword ?? "Forgot password?"}
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                {loading ? (l?.signingIn ?? "Signing in...") : (l?.signInBtn ?? "Sign In")}
              </Button>
            </form>
          </Form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {l?.noAccount ?? "Don't have an account?"}{" "}
            <Link href={redirectTo ? `/signup?redirect=${encodeURIComponent(redirectTo)}` : "/signup"} className="font-medium text-primary hover:underline">
              {l?.signUpFree ?? "Sign up free"}
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>{l?.ssl ?? "Secured with 256-bit SSL encryption"}</span>
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
          <h2 className="mb-3 text-2xl font-bold">{l?.sideTitle ?? "All your PDF tools in one place"}</h2>
          <p className="text-sm opacity-80">
            {l?.sideSubtitle ?? "Edit, sign, convert, merge and compress PDFs online. No software needed."}
          </p>
          <div className="mt-8 space-y-3 text-left">
            {featKeys.map((k, i) => (
              <div key={k} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
                {l?.[k] ?? defaultFeats[i]}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
