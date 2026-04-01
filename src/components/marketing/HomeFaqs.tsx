import { FaqAccordion } from "@/components/shared/FaqAccordion";

const faqs = [
  {
    question: "Is DocForge really free to use?",
    answer: "Yes. You can upload, preview, and use all our editing tools for free. A premium plan ($0.99 trial, then $9.99/month) is required to download the processed files.",
  },
  {
    question: "Is my document safe?",
    answer: "Absolutely. All uploads are encrypted via SSL. We never read or share your files. Uploaded files are permanently deleted from our servers after 2 hours automatically.",
  },
  {
    question: "Do I need to install any software?",
    answer: "No installation needed. DocForge is 100% browser-based and works on any device — Windows, Mac, Linux, iOS, and Android.",
  },
  {
    question: "How does the trial work?",
    answer: `The trial gives you full Premium access for 7 days for just $0.99. After the trial period, your subscription automatically renews at $9.99/month. You can cancel any time from your account dashboard before the trial ends.`,
  },
  {
    question: "Can I cancel my subscription?",
    answer: "Yes, anytime. Go to your Account → Billing → Cancel Subscription. Cancelling stops future renewals. You keep access until the end of your current billing period.",
  },
  {
    question: "What file types are supported?",
    answer: "We support PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), JPG, PNG, GIF, and WEBP files depending on the tool used.",
  },
  {
    question: "What is the maximum file size?",
    answer: "Free users can upload files up to 5MB. Premium users can upload files up to 100MB per file.",
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
            Everything you need to know about DocForge.
          </p>
        </div>
        <FaqAccordion items={faqs} />
      </div>
    </section>
  );
}
