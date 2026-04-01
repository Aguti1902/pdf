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
import { FileText, Lock, Eye, EyeOff } from "lucide-react";
import { signInSchema, type SignInInput } from "@/lib/validations";
import { toast } from "sonner";
import { SITE } from "@/config/seo";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: SignInInput) => {
    setLoading(true);
    try {
      // TODO: implement auth
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Signed in successfully!");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </div>
            <span className="gradient-text">{SITE.name}</span>
          </Link>

          <h1 className="mb-1 text-2xl font-bold">Welcome back</h1>
          <p className="mb-7 text-sm text-muted-foreground">
            Sign in to your account to continue.
          </p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                        Forgot password?
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
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </Form>

          <p className="mt-5 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary hover:underline">
              Sign up free
            </Link>
          </p>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            <span>Secured with 256-bit SSL encryption</span>
          </div>
        </div>
      </div>

      {/* Right — brand panel (hidden on mobile) */}
      <div className="hidden flex-col items-center justify-center gradient-primary p-12 text-white lg:flex lg:w-2/5">
        <div className="max-w-xs text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <FileText className="h-8 w-8" />
            </div>
          </div>
          <h2 className="mb-3 text-2xl font-bold">All your PDF tools in one place</h2>
          <p className="text-sm opacity-80">
            Edit, sign, convert, merge and compress PDFs online. No software needed.
          </p>
          <div className="mt-8 space-y-3 text-left">
            {[
              "21+ professional PDF tools",
              "Unlimited downloads with Premium",
              "Secure & private — files auto-deleted",
              "Works on any device, any browser",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
