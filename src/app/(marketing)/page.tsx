import type { Metadata } from "next";
import { Hero } from "@/components/marketing/Hero";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { ToolsGrid } from "@/components/marketing/ToolsGrid";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { Testimonials } from "@/components/marketing/Testimonials";
import { HomeFaqs } from "@/components/marketing/HomeFaqs";
import { CtaSection } from "@/components/marketing/CtaSection";
import { WhySection } from "@/components/marketing/WhySection";
import { DEFAULT_METADATA } from "@/config/seo";

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  alternates: { canonical: "/" },
};

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

      <WhySection />

      <Testimonials />
      <HomeFaqs />
      <CtaSection />
    </>
  );
}
