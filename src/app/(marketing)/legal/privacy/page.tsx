import type { Metadata } from "next";
import { SITE } from "@/config/seo";

export const metadata: Metadata = {
  title: "Privacy Policy – PDFCraft",
  description: "Read PDFCraft's Privacy Policy.",
};

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Privacy Policy</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 1, 2026</p>

      <div className="space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Information We Collect</h2>
          <p className="text-muted-foreground">We collect information you provide when creating an account (name, email, password) and payment information processed by our payment provider, Stripe. We also collect usage data such as tool usage, browser type, and IP address for analytics and security purposes.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. File Processing</h2>
          <p className="text-muted-foreground">Files you upload are processed on encrypted servers and automatically and permanently deleted after 2 hours. We do not read, analyze, or share the content of your files. Our employees cannot access your uploaded files.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>To provide and improve the Service</li>
            <li>To process payments and manage subscriptions</li>
            <li>To send transactional emails (receipts, account notifications)</li>
            <li>To prevent fraud and ensure security</li>
            <li>To respond to support requests</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Data Sharing</h2>
          <p className="text-muted-foreground">We do not sell your personal data. We share data only with service providers necessary to operate the Service (Stripe for payments, AWS for infrastructure) under strict data processing agreements.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Cookies</h2>
          <p className="text-muted-foreground">We use essential cookies for authentication and session management, and optional analytics cookies. See our <a href="/legal/cookies" className="text-primary underline">Cookie Policy</a> for details.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Your Rights</h2>
          <p className="text-muted-foreground">You have the right to access, correct, export, or delete your personal data at any time. Contact us at <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">{SITE.legalEmail}</a> to exercise these rights.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. Data Retention</h2>
          <p className="text-muted-foreground">Account data is retained while your account is active. You may request deletion at any time. Uploaded files are always deleted within 2 hours. Billing records are retained for 7 years as required by law.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Contact</h2>
          <p className="text-muted-foreground">For privacy inquiries, contact our Data Protection team at <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">{SITE.legalEmail}</a>.</p>
        </section>
      </div>
    </div>
  );
}
