"use client";

import Link from "next/link";
import { FileText } from "lucide-react";
import { SITE } from "@/config/seo";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t, messages } = useLanguage();
  const nav = messages ? t("nav") : null;
  const footer = messages ? t("footer") : null;
  const tools = messages ? t("tools") : null;

  const footerLinks = {
    [footer?.tools ?? "Tools"]: [
      { name: tools?.editPdf ?? "Edit PDF", href: "/edit-pdf" },
      { name: tools?.signPdf ?? "Sign PDF", href: "/sign-pdf" },
      { name: tools?.merge ?? "Merge PDF", href: "/merge-pdf" },
      { name: tools?.split ?? "Split PDF", href: "/split-pdf" },
      { name: tools?.compress ?? "Compress PDF", href: "/compress-pdf" },
      { name: tools?.pdfToWord ?? "PDF to Word", href: "/pdf-to-word" },
      { name: tools?.wordToPdf ?? "Word to PDF", href: "/word-to-pdf" },
    ],
    [footer?.company ?? "Product"]: [
      { name: nav?.pricing ?? "Pricing", href: "/pricing" },
      { name: nav?.blog ?? "Blog", href: "/blog" },
      { name: footer?.contact ?? "Contact", href: "/contact" },
    ],
    [footer?.legal ?? "Legal"]: [
      { name: footer?.terms ?? "Terms of Service", href: "/legal/terms" },
      { name: footer?.privacy ?? "Privacy Policy", href: "/legal/privacy" },
      { name: footer?.cookies ?? "Cookie Policy", href: "/legal/cookies" },
      { name: footer?.subscription ?? "Subscription Terms", href: "/legal/subscription" },
      { name: footer?.refund ?? "Refund Policy", href: "/legal/refund" },
    ],
  };

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 font-bold text-lg">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <FileText className="h-3.5 w-3.5" />
              </div>
              <span>{SITE.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {footer?.tagline ?? "The professional PDF platform for everyone."}
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                All systems operational
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              © {new Date().getFullYear()} {SITE.companyName} All rights reserved.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h3 className="mb-3 text-sm font-semibold">{group}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
          <p>Secure processing · Files deleted after 2 hours · SSL encrypted</p>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="hover:text-foreground">
              {footer?.privacy ?? "Privacy"}
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground">
              {footer?.terms ?? "Terms"}
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              {footer?.contact ?? "Support"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
