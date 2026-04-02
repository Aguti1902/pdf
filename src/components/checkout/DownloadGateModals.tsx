"use client";

import { AuthModal } from "@/components/auth/AuthModal";
import { PaywallModal } from "@/components/checkout/PaywallModal";
import type { useDownloadGate } from "@/hooks/useDownloadGate";

interface Props {
  gate: ReturnType<typeof useDownloadGate>;
  toolName?: string;
}

/**
 * Renders the auth + paywall modals for the download gate flow.
 * Drop this anywhere inside the processor component.
 */
export function DownloadGateModals({ gate, toolName }: Props) {
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
      />
    </>
  );
}
