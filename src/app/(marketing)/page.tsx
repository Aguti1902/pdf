import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { ToolsGrid } from "@/components/marketing/ToolsGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { HomeFaqs } from "@/components/marketing/HomeFaqs";
import { CtaSection } from "@/components/marketing/CtaSection";
import { FeatureCard } from "@/components/shared/FeatureCard";
import {
  Shield,
  Zap,
  Globe,
  Smartphone,
  RefreshCw,
  HeadphonesIcon,
} from "lucide-react";
import { DEFAULT_METADATA } from "@/config/seo";

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  alternates: { canonical: "/" },
};

const whyFeatures = [
  {
    icon: Shield,
    title: "Bank-level security",
    description:
      "All file transfers are encrypted with 256-bit SSL. Your documents are never stored beyond 2 hours and never shared.",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    icon: Zap,
    title: "Lightning fast",
    description:
      "Our infrastructure processes files in seconds, not minutes. No queues, no waiting for a desktop app to load.",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50 dark:bg-amber-900/20",
  },
  {
    icon: Globe,
    title: "Works everywhere",
    description:
      "Browser-based — works on Windows, macOS, Linux. No installation, no plugins, no browser extensions required.",
    iconColor: "text-green-600",
    iconBg: "bg-green-50 dark:bg-green-900/20",
  },
  {
    icon: Smartphone,
    title: "Mobile optimized",
    description:
      "Fully responsive design works beautifully on phones and tablets. Edit PDFs on the go from any device.",
    iconColor: "text-purple-600",
    iconBg: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    icon: RefreshCw,
    title: "Always up to date",
    description:
      "New features and improvements ship weekly. No manual updates needed — you always get the latest version.",
    iconColor: "text-cyan-600",
    iconBg: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    icon: HeadphonesIcon,
    title: "Responsive support",
    description:
      "Premium members get priority email support with fast response times. We're here when you need us.",
    iconColor: "text-rose-600",
    iconBg: "bg-rose-50 dark:bg-rose-900/20",
  },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Trust strip */}
      <section className="border-y py-8 bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4">
          <TrustBadges />
        </div>
      </section>

      <ToolsGrid />
      <HowItWorks />

      {/* Why PDFCraft */}
      <section className="py-20 border-t">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
              Why teams choose PDFCraft
            </h2>
            <p className="mx-auto max-w-xl text-muted-foreground">
              Built for professionals who need reliable, fast, and private PDF
              processing without complexity.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {whyFeatures.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <Testimonials />
      <HomeFaqs />
      <CtaSection />
    </>
  );
}
