"use client";

import { Shield, Zap, Globe, Smartphone, RefreshCw, HeadphonesIcon } from "lucide-react";
import { FeatureCard } from "@/components/shared/FeatureCard";
import { useLanguage } from "@/contexts/LanguageContext";

const ICON_STYLES = [
  { icon: Shield, iconColor: "text-blue-600", iconBg: "bg-blue-50 dark:bg-blue-900/20" },
  { icon: Zap, iconColor: "text-amber-600", iconBg: "bg-amber-50 dark:bg-amber-900/20" },
  { icon: Globe, iconColor: "text-green-600", iconBg: "bg-green-50 dark:bg-green-900/20" },
  { icon: Smartphone, iconColor: "text-purple-600", iconBg: "bg-purple-50 dark:bg-purple-900/20" },
  { icon: RefreshCw, iconColor: "text-cyan-600", iconBg: "bg-cyan-50 dark:bg-cyan-900/20" },
  { icon: HeadphonesIcon, iconColor: "text-rose-600", iconBg: "bg-rose-50 dark:bg-rose-900/20" },
];

const FEAT_KEYS = [
  { title: "f1t", desc: "f1d" },
  { title: "f2t", desc: "f2d" },
  { title: "f3t", desc: "f3d" },
  { title: "f4t", desc: "f4d" },
  { title: "f5t", desc: "f5d" },
  { title: "f6t", desc: "f6d" },
] as const;

export function WhySection() {
  const { t, messages } = useLanguage();
  const w = messages ? t("why") : null;

  return (
    <section className="py-20 border-t">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
            {w?.title ?? "Why teams choose PDFCraft"}
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            {w?.subtitle ?? "Built for professionals who need reliable, fast, and private PDF processing."}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEAT_KEYS.map((k, i) => (
            <FeatureCard
              key={k.title}
              icon={ICON_STYLES[i].icon}
              iconColor={ICON_STYLES[i].iconColor}
              iconBg={ICON_STYLES[i].iconBg}
              title={w?.[k.title] ?? k.title}
              description={w?.[k.desc] ?? k.desc}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
