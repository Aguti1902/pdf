"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { PaywallModal } from "@/components/checkout/PaywallModal";

function CheckoutTriggerInner() {
  const searchParams  = useSearchParams();
  const router        = useRouter();
  const pathname      = usePathname();
  const [show,            setShow]            = useState(false);
  const [email,           setEmail]           = useState("");
  const [name,            setName]            = useState("");
  const [hadSubscription, setHadSubscription] = useState(false);

  useEffect(() => {
    if (!searchParams.get("checkout")) return;

    // Remove ?checkout=1 from the URL immediately (no page reload)
    const params = new URLSearchParams(searchParams.toString());
    params.delete("checkout");
    const newUrl = pathname + (params.size > 0 ? `?${params}` : "");
    router.replace(newUrl);

    // Verify user session and subscription status
    (async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) return;
        const me = await meRes.json();
        if (!me?.user) return;

        const subRes = await fetch("/api/subscription");
        const sub = subRes.ok ? await subRes.json() : {};
        if (sub.isPremium) return; // ya tiene suscripción activa

        setEmail(me.user.email ?? "");
        setName(me.user.name  ?? "");
        setHadSubscription(sub.hadSubscription ?? false);
        setShow(true);
      } catch { /* ignore */ }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  return (
    <PaywallModal
      open={show}
      onClose={() => setShow(false)}
      userEmail={email}
      userName={name}
      hadSubscription={hadSubscription}
      toolName="PDFCraft Premium"
    />
  );
}

export function CheckoutTrigger() {
  return (
    <Suspense>
      <CheckoutTriggerInner />
    </Suspense>
  );
}
