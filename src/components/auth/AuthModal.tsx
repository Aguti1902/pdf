"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GoogleButton } from "@/components/auth/GoogleButton";

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
    if (!email || !password) { setError("Por favor rellena todos los campos."); return; }
    if (tab === "register" && !name.trim()) { setError("Por favor escribe tu nombre."); return; }
    setLoading(true);
    try {
      const endpoint = tab === "register" ? "/api/auth/register" : "/api/auth/login";
      const body = tab === "register"
        ? { name, email, password }
        : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.error ?? "Something went wrong."); setLoading(false); return; }

      onSuccess(data.user.email, data.user.name ?? email.split("@")[0]);
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl border bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative border-b px-6 py-5 text-center">
          <button onClick={onClose} className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground">✕</button>
          <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">P</span>
          </div>
          <h2 className="text-lg font-bold">
            {tab === "register" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {tab === "register" ? "Sign up to save and download your document" : "Sign in to continue"}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Google */}
          <GoogleButton redirectTo="/dashboard" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Tabs */}
          <div className="flex rounded-lg border p-0.5">
            {(["register", "login"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }}
                className={cn("flex-1 rounded-md py-1.5 text-sm font-medium transition-all",
                  tab === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {t === "register" ? "Sign up" : "Sign in"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {tab === "register" && (
              <input type="text" placeholder="Your name" value={name}
                onChange={e => setName(e.target.value)}
                className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            )}
            <input type="email" placeholder="Email address" value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <input type="password" placeholder="Password (min. 8 characters)" value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />

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

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            By continuing you agree to our{" "}
            <a href="/legal/terms" className="underline hover:text-foreground">Terms of Service</a>{" "}and{" "}
            <a href="/legal/privacy" className="underline hover:text-foreground">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
