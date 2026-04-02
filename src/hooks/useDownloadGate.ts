"use client";

import { useState, useRef } from "react";
import { triggerDownload } from "@/lib/pdf-processing/download";

export type DownloadGateStep = "idle" | "auth" | "paywall";

/**
 * Full gated download flow for client-side processed files:
 *   1. Check if logged in   → if not: show AuthModal
 *   2. After login:           check subscription
 *   3. If not subscribed    → show PaywallModal
 *   4. If subscribed        → download immediately
 *
 * Usage:
 *   const gate = useDownloadGate();
 *   <button onClick={() => gate.request(blob, "file.pdf")}>Download</button>
 *   <DownloadGateModals gate={gate} toolName="Merge PDF" />
 */
export function useDownloadGate() {
  const [step, setStep] = useState<DownloadGateStep>("idle");
  const pending = useRef<{ blob: Blob; filename: string } | null>(null);

  const request = async (blob: Blob, filename: string) => {
    pending.current = { blob, filename };

    // 1. Check auth
    try {
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) { setStep("auth"); return; }

      // 2. Check subscription
      const subRes = await fetch("/api/subscription");
      const sub = subRes.ok ? await subRes.json() : {};
      if (sub.isPremium) {
        triggerDownload(blob, filename);
        pending.current = null;
        return;
      }
      // Logged in but not subscribed → paywall
      setStep("paywall");
    } catch {
      // Network error or not logged in → show auth
      setStep("auth");
    }
  };

  /** Called by AuthModal onSuccess after login/register */
  const onAuthSuccess = async () => {
    setStep("idle");
    if (!pending.current) return;
    // Re-check subscription now that user is logged in
    try {
      const subRes = await fetch("/api/subscription");
      const sub = subRes.ok ? await subRes.json() : {};
      if (sub.isPremium) {
        triggerDownload(pending.current.blob, pending.current.filename);
        pending.current = null;
      } else {
        setStep("paywall");
      }
    } catch {
      setStep("paywall");
    }
  };

  const close = () => setStep("idle");

  return { request, step, onAuthSuccess, close, pending };
}
