"use client";

import { useState, useEffect } from "react";
import type { SubscriptionStatus } from "@/types";

interface SubscriptionData {
  status: SubscriptionStatus;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  plan: "monthly" | "yearly" | null;
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const res = await fetch("/api/subscription");
        if (res.ok) {
          const json = await res.json();
          setData({
            ...json,
            currentPeriodEnd: json.currentPeriodEnd
              ? new Date(json.currentPeriodEnd)
              : null,
          });
        } else {
          setData({ status: "free", currentPeriodEnd: null, cancelAtPeriodEnd: false, plan: null });
        }
      } catch {
        setData({ status: "free", currentPeriodEnd: null, cancelAtPeriodEnd: false, plan: null });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const isPremium =
    data?.status === "active" || data?.status === "trialing";

  const openPortal = async () => {
    const res = await fetch("/api/stripe/create-portal", { method: "POST" });
    if (res.ok) {
      const { url } = await res.json();
      window.location.href = url;
    }
  };

  return { data, loading, isPremium, openPortal };
}
