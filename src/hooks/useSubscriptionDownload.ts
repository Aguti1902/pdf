"use client";

import { useState } from "react";
import { triggerDownload } from "@/lib/pdf-processing/download";

/**
 * Handles the download-or-paywall flow for client-side processed files.
 * Checks subscription status first; shows PaywallModal if not subscribed.
 */
export function useSubscriptionDownload() {
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingBlob, setPendingBlob] = useState<{ blob: Blob; filename: string } | null>(null);

  const requestDownload = async (blob: Blob, filename: string) => {
    try {
      const res = await fetch("/api/subscription");
      const data = res.ok ? await res.json() : {};
      if (data.isPremium) {
        triggerDownload(blob, filename);
        return;
      }
    } catch { /* offline or not logged in — fall through to paywall */ }
    setPendingBlob({ blob, filename });
    setShowPaywall(true);
  };

  return {
    requestDownload,
    showPaywall,
    closePaywall: () => setShowPaywall(false),
    pendingBlob,
  };
}
