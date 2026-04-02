"use client";

import { useState } from "react";
import Link from "next/link";
import { FileUploader } from "@/components/tools/FileUploader";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { TrustBadges } from "@/components/shared/TrustBadges";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { Tool } from "@/config/tools";
import type { UploadedFile } from "@/types";
import { getRelatedTools } from "@/config/tools";
import * as Icons from "lucide-react";
import { PaywallModal } from "@/components/checkout/PaywallModal";

interface ToolPageProps {
  tool: Tool;
}

export function ToolPage({ tool }: ToolPageProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const relatedTools = getRelatedTools(tool.id);

  const IconComponent = (Icons as unknown as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.FileText;

  const handleUploadComplete = (file: UploadedFile) => {
    setUploadedFile(file);
  };

  const handleContinue = () => {
    setShowPaywall(true);
  };

  const acceptMap: Record<string, Record<string, string[]>> = {
    "convert-to": {
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-powerpoint": [".ppt"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
    },
    "convert-from": { "application/pdf": [".pdf"] },
    edit: { "application/pdf": [".pdf"] },
    organize: { "application/pdf": [".pdf"] },
  };

  return (
    <>
      <div className="min-h-screen">
        {/* Breadcrumb */}
        <div className="border-b bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 py-2">
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">Home</Link>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{tool.name}</span>
            </nav>
          </div>
        </div>

        {/* Hero */}
        <section className="py-16 text-center" style={{ background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${tool.color}15 0%, transparent 70%)` }}>
          <div className="container mx-auto max-w-3xl px-4">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: tool.bgColor }}>
              <IconComponent className="h-8 w-8" style={{ color: tool.color }} />
            </div>
            <Badge variant="secondary" className="mb-3">Professional PDF Tool</Badge>
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
              {tool.name} Online
            </h1>
            <p className="mb-8 text-lg text-muted-foreground max-w-xl mx-auto">
              {tool.longDescription}
            </p>

            <div className="mx-auto max-w-lg">
              <FileUploader
                accept={acceptMap[tool.category]}
                onUploadComplete={handleUploadComplete}
                label={`Drop your file here`}
                description={`or click to browse · No account needed to upload`}
              />
              {uploadedFile && (
                <Button
                  size="lg"
                  className="mt-4 w-full gap-2 text-base"
                  onClick={handleContinue}
                >
                  Continue with {tool.name}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="mt-6">
              <TrustBadges compact />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-14 border-t">
          <div className="container mx-auto max-w-5xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold">Why use PDFCraft for {tool.name}?</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tool.benefits.map((benefit) => (
                <div key={benefit} className="flex items-start gap-2.5 rounded-lg border bg-card p-4">
                  <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icons.Check className="h-3 w-3 text-primary" />
                  </div>
                  <p className="text-sm">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-14 bg-muted/30 border-t">
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <h2 className="mb-10 text-2xl font-bold">How to {tool.name}</h2>
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                { step: "1", title: "Upload your file", desc: "Drag & drop or select your file. Secure and private." },
                { step: "2", title: "Apply changes", desc: `Use our ${tool.name.toLowerCase()} tool to make your modifications.` },
                { step: "3", title: "Download result", desc: "Get your processed file instantly. Clean output guaranteed." },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                    {s.step}
                  </div>
                  <h3 className="mb-1 font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        {tool.faqs.length > 0 && (
          <section className="py-14 border-t">
            <div className="container mx-auto max-w-2xl px-4">
              <h2 className="mb-8 text-center text-2xl font-bold">Frequently Asked Questions</h2>
              <FaqAccordion items={tool.faqs} />
            </div>
          </section>
        )}

        {/* Related Tools */}
        {relatedTools.length > 0 && (
          <section className="py-14 bg-muted/30 border-t">
            <div className="container mx-auto max-w-5xl px-4">
              <h2 className="mb-8 text-center text-2xl font-bold">Related Tools</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {relatedTools.map((t) => {
                  const RelIcon = (Icons as unknown as Record<string, Icons.LucideIcon>)[t.icon] ?? Icons.FileText;
                  return (
                    <Link
                      key={t.id}
                      href={`/${t.slug}`}
                      className="tool-card flex items-center gap-3 rounded-xl border bg-card p-4 hover:border-primary/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: t.bgColor }}>
                        <RelIcon className="h-5 w-5" style={{ color: t.color }} />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="py-14 border-t">
          <div className="container mx-auto max-w-xl px-4 text-center">
            <h2 className="mb-3 text-2xl font-bold">Ready to get started?</h2>
            <p className="mb-6 text-muted-foreground">No account required to try. Upgrade when you need more.</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="gap-2" asChild>
                <Link href="/signup">Start for Free <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <PaywallModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        toolName={tool.name}
      />
    </>
  );
}
