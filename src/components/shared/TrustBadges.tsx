"use client";

import { Shield, Zap, Globe, Smartphone, Lock, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const BADGE_ICONS = [Shield, Clock, Zap, Globe, Smartphone, Lock];
const BADGE_KEYS = [
  { label: "ssl", desc: "sslDesc" },
  { label: "autoDelete", desc: "autoDeleteDesc" },
  { label: "instant", desc: "instantDesc" },
  { label: "online", desc: "onlineDesc" },
  { label: "mobile", desc: "mobileDesc" },
  { label: "private", desc: "privateDesc" },
] as const;

export function TrustBadges({ compact = false }: { compact?: boolean }) {
  const { t, messages } = useLanguage();
  const tr = messages ? t("trust") : null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-4">
        {BADGE_KEYS.map((b, i) => {
          const Icon = BADGE_ICONS[i];
          return (
            <div key={b.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 text-primary" />
              <span>{tr?.[b.label] ?? b.label}</span>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {BADGE_KEYS.map((b, i) => {
        const Icon = BADGE_ICONS[i];
        return (
          <div
            key={b.label}
            className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-semibold">{tr?.[b.label] ?? b.label}</p>
              <p className="text-xs text-muted-foreground">{tr?.[b.desc] ?? b.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
