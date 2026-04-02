"use client";

import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { useLanguage } from "@/contexts/LanguageContext";

export function HomeFaqs() {
  const { t, messages } = useLanguage();
  const f = messages ? t("faqs") : null;

  const faqs = [
    { question: f?.q1 ?? "Is PDFCraft free to use?", answer: f?.a1 ?? "" },
    { question: f?.q2 ?? "How does the trial work?", answer: f?.a2 ?? "" },
    { question: f?.q3 ?? "How do I cancel?", answer: f?.a3 ?? "" },
    { question: f?.q4 ?? "Is my document safe?", answer: f?.a4 ?? "" },
    { question: f?.q5 ?? "Do I need to install software?", answer: f?.a5 ?? "" },
    { question: f?.q6 ?? "What file types are supported?", answer: f?.a6 ?? "" },
  ];

  return (
    <section className="py-20 bg-muted/30 border-t">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
            {f?.title ?? "Frequently Asked Questions"}
          </h2>
          <p className="text-muted-foreground">
            {f?.subtitle ?? "Everything you need to know about PDFCraft."}
          </p>
        </div>
        <FaqAccordion items={faqs} />
      </div>
    </section>
  );
}
