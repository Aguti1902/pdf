"use client";

import { useState } from "react";
import Link from "next/link";
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

const perks = [
  "Free access to all PDF tools",
  "Try edit, sign, convert and more",
  "No credit card required to start",
];

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = async (data: SignUpInput) => {
    setLoading(true);
    try {
      // TODO: implement auth
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Account created! Welcome to PDFCraft.");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

          <h1 className="mb-1 text-2xl font-bold">Create your account</h1>
          <p className="mb-2 text-sm text-muted-foreground">
            Get started for free — no credit card required.
          </p>
          <ul className="mb-6 space-y-1">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-green-500" />
                {p}
              </li>
            ))}
          </ul>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
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
                    <FormLabel>Email</FormLabel>
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
                    <FormLabel>Password</FormLabel>
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
                {loading ? "Creating account..." : "Create Free Account"}
              </Button>
            </form>
          </Form>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link href="/legal/terms" className="underline">Terms</Link> and{" "}
            <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.
          </p>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secured with 256-bit SSL encryption</span>
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
          <h2 className="mb-3 text-2xl font-bold">Start working with PDFs today</h2>
          <p className="text-sm opacity-80">
            Join 500,000+ professionals who use {SITE.name} to edit, sign, and convert PDFs daily.
          </p>
        </div>
      </div>
    </div>
  );
}
