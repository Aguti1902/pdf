import type { Metadata } from "next";
import { SITE } from "@/config/seo";

export const metadata: Metadata = {
  title: "Terms of Service – DocForge",
  description: "Read DocForge's Terms of Service.",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-extrabold">Terms of Service</h1>
      <p className="mb-8 text-sm text-muted-foreground">Last updated: April 1, 2026</p>

      <div className="prose prose-sm max-w-none dark:prose-invert space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-bold mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using {SITE.name} ("Service"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">2. Description of Service</h2>
          <p>{SITE.name} provides online PDF editing, conversion, signing, and processing tools. The Service is available via a web browser and does not require any software installation.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">3. User Accounts</h2>
          <p>You may use some features without an account. Creating an account requires accurate information. You are responsible for maintaining the security of your account credentials.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">4. Subscription and Billing</h2>
          <p>Paid plans are offered on a subscription basis. By starting a trial or subscribing, you authorize {SITE.companyName} to charge your payment method at the rates specified at checkout. See our <a href="/legal/subscription" className="text-primary underline">Subscription Terms</a> for complete details.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">5. Acceptable Use</h2>
          <p>You agree not to use the Service to process files containing illegal, harmful, or infringing content. You must not attempt to reverse engineer, overload, or disrupt the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">6. Intellectual Property</h2>
          <p>All content, logos, and software of {SITE.name} are owned by {SITE.companyName}. You retain ownership of all files you upload and process.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">7. File Processing and Privacy</h2>
          <p>Files uploaded to {SITE.name} are processed on our secure servers and permanently deleted after 2 hours. We do not read, share, or store your file content beyond what is necessary to provide the Service.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">8. Limitation of Liability</h2>
          <p>{SITE.companyName} is not liable for any indirect, incidental, or consequential damages arising from the use of the Service. The Service is provided "as is" without warranties of any kind.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">9. Termination</h2>
          <p>We reserve the right to terminate or suspend accounts that violate these Terms. You may close your account at any time.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">10. Governing Law</h2>
          <p>These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold mb-2">11. Contact</h2>
          <p>For questions about these Terms, contact us at <a href={`mailto:${SITE.legalEmail}`} className="text-primary underline">{SITE.legalEmail}</a>.</p>
        </section>
      </div>
    </div>
  );
}
