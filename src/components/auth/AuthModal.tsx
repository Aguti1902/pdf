"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (email: string, name: string) => void;
}

export function AuthModal({ open, onClose, onSuccess }: AuthModalProps) {
  const [tab,      setTab]      = useState<"login" | "register">("register");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (tab === "register" && !name.trim()) { setError("Please enter your name."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    onSuccess(email, name || email.split("@")[0]);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    setLoading(false);
    // In real implementation: get email from Google OAuth provider
    onSuccess("google@user.com", "Google User");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative border-b px-6 py-5 text-center">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">✕</button>
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">D</span>
          </div>
          <h2 className="text-lg font-bold">
            {tab === "register" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tab === "register" ? "Start your 7-day trial for just 0,50 €" : "Sign in to continue editing"}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border bg-background px-4 py-2.5 text-sm font-medium transition-all hover:bg-muted disabled:opacity-60"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border p-0.5">
            {(["register", "login"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={cn("flex-1 rounded-md py-1.5 text-sm font-medium transition-all capitalize",
                  tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {t === "register" ? "Sign up" : "Sign in"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "register" && (
              <input
                type="text" placeholder="Your name" value={name} onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            )}
            <input
              type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {error && <p className="rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</p>}

            <Button type="submit" className="h-10 w-full font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Please wait...
                </span>
              ) : tab === "register" ? "Create account & continue" : "Sign in & continue"}
            </Button>
          </form>

          {tab === "register" && (
            <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
              By creating an account you agree to our{" "}
              <a href="/legal/terms" className="underline hover:text-foreground">Terms</a> and{" "}
              <a href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
              After the 7-day trial (0,50 €), your subscription renews at 49,90 €/month.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
