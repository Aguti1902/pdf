"use client";

import { useEffect, useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import { triggerDownload } from "@/lib/pdf-processing/download";
import type { useDownloadGate } from "@/hooks/useDownloadGate";

interface Props {
  gate: ReturnType<typeof useDownloadGate>;
  toolName?: string;
}

/**
 * Renders the auth + paywall modals for the download gate flow.
 * - Fetches the logged-in user's email/name so Stripe creates a real customer (not "guest").
 * - After payment, downloads the pending file before redirecting to dashboard.
 */
export function DownloadGateModals({ gate, toolName }: Props) {
  const [userEmail,       setUserEmail]       = useState<string>("");
  const [userName,        setUserName]        = useState<string>("");
  const [hadSubscription, setHadSubscription] = useState(false);

  // Fetch user + subscription status whenever the modal becomes active
  useEffect(() => {
    if (gate.step === "idle") return;
    Promise.all([
      fetch("/api/auth/me").then(r => r.ok ? r.json() : null),
      fetch("/api/subscription").then(r => r.ok ? r.json() : null),
    ]).then(([meData, subData]) => {
      if (meData?.user) {
        setUserEmail(meData.user.email ?? "");
        setUserName(meData.user.name   ?? "");
      }
      if (subData?.hadSubscription) setHadSubscription(true);
    }).catch(() => {});
  }, [gate.step]);

  /** Called right after Stripe confirms payment — triggers the download before the success redirect */
  const handlePaymentSuccess = () => {
    if (gate.pending.current) {
      triggerDownload(gate.pending.current.blob, gate.pending.current.filename);
      gate.pending.current = null;
    }
  };

  return (
    <>
      <AuthModal
        open={gate.step === "auth"}
        onClose={gate.close}
        onSuccess={gate.onAuthSuccess}
      />
      <PaywallModal
        open={gate.step === "paywall"}
        onClose={gate.close}
        toolName={toolName}
        userEmail={userEmail}
        userName={userName}
        onPaymentSuccess={handlePaymentSuccess}
        noRedirect
        hadSubscription={hadSubscription}
      />
    </>
  );
}
