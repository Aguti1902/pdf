import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { PRICING } from "@/config/pricing";

const faqs = [
  {
    question: "Is PDFCraft free to use?",
    answer: `PDFCraft is a subscription service. You can open the editor and preview your document for free, but downloading requires an active subscription. Start for just ${PRICING.trial.label} for a ${PRICING.trial.days}-day full access trial, then ${PRICING.monthly.label}/month.`,
  },
  {
    question: "How does the trial work?",
    answer: `Pay ${PRICING.trial.label} today and get full access to all tools for ${PRICING.trial.days} days. After the trial, your subscription automatically renews at ${PRICING.monthly.label}/month until cancelled. Cancel any time before the trial ends to pay nothing more.`,
  },
  {
    question: "How do I cancel?",
    answer: "Log into your account → Dashboard → Billing → Cancel Subscription. One click, instant. No calls, no forms. You keep access until the end of the current billing period.",
  },
  {
    question: "Is my document safe?",
    answer: "Yes. All uploads are encrypted with SSL. We never read or share your files. All uploaded files are permanently and automatically deleted from our servers after 2 hours.",
  },
  {
    question: "Do I need to install software?",
    answer: "No. PDFCraft works 100% in your browser — on any device, any OS. No downloads, no plugins required.",
  },
  {
    question: "What file types are supported?",
    answer: "PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), JPG, PNG, GIF and WEBP depending on the tool.",
  },
];

export function HomeFaqs() {
  return (
    <section className="py-20 bg-muted/30 border-t">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about PDFCraft.
          </p>
        </div>
        <FaqAccordion items={faqs} />
      </div>
    </section>
  );
}
