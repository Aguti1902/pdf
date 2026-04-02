import type { Metadata } from "next";
import { FaqAccordion } from "@/components/shared/FaqAccordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "FAQ – PDFCraft Help Center",
  description: "Frequently asked questions about PDFCraft PDF tools, pricing, billing, and file security.",
  alternates: { canonical: "/faq" },
};

const sections = [
  {
    title: "Getting Started",
    items: [
      { question: "Do I need to create an account to use PDFCraft?", answer: "No. You can upload and process files without an account. An account is required to access your file history and manage your subscription." },
      { question: "What file types does PDFCraft support?", answer: "PDF, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx), JPG, PNG, GIF, and WEBP files depending on the tool." },
      { question: "Is there a file size limit?", answer: "Free users: up to 5MB per file. Premium users: up to 100MB per file." },
      { question: "Does PDFCraft work on mobile?", answer: "Yes. PDFCraft is fully responsive and works on iPhone, Android, tablet, and any modern browser." },
    ],
  },
  {
    title: "Billing & Subscription",
    items: [
      { question: "How does the $0.99 trial work?", answer: "You get 7 days of full Premium access for $0.99. After 7 days, your subscription auto-renews at $9.99/month until cancelled." },
      { question: "How do I cancel my subscription?", answer: "Log in → Dashboard → Billing → Cancel Subscription. Takes effect immediately. No future charges." },
      { question: "Will I be notified before renewal?", answer: "Yes. We send a reminder email at least 3 days before your trial ends and before each monthly renewal." },
      { question: "Can I get a refund?", answer: "The $0.99 trial fee is non-refundable. Monthly charges can be refunded within 3 days if no files were downloaded. Contact support@pdfcraft.online." },
    ],
  },
  {
    title: "Privacy & Security",
    items: [
      { question: "Are my files secure?", answer: "Yes. All uploads are encrypted with SSL. Files are processed on secure servers and permanently deleted after 2 hours." },
      { question: "Can PDFCraft employees read my files?", answer: "No. Your files are processed automatically and no PDFCraft staff can access the content of your uploaded files." },
      { question: "Does PDFCraft store my files permanently?", answer: "No. All files are automatically and permanently deleted after 2 hours, regardless of subscription status." },
    ],
  },
  {
    title: "Technical Questions",
    items: [
      { question: "Why is my PDF not processing correctly?", answer: "Some PDFs are password-protected, damaged, or use non-standard encoding. Try removing password protection first, or contact support." },
      { question: "What browser should I use?", answer: "PDFCraft works best on Chrome, Firefox, Safari, and Edge (latest versions). We recommend keeping your browser updated." },
      { question: "Is there an API?", answer: "An API for developers is in development and will be available to Premium users. Stay tuned for updates." },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="py-16">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-3 text-4xl font-extrabold">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to the most common questions about PDFCraft.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="mb-4 text-lg font-bold">{section.title}</h2>
              <FaqAccordion items={section.items} />
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-muted/40 p-8 text-center">
          <h2 className="mb-2 text-xl font-bold">Still need help?</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Our support team typically replies within 24 hours.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
