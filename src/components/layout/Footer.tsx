import Link from "next/link";
import { FileText } from "lucide-react";
import { SITE } from "@/config/seo";

const footerLinks = {
  Tools: [
    { name: "Edit PDF", href: "/edit-pdf" },
    { name: "Sign PDF", href: "/sign-pdf" },
    { name: "Merge PDF", href: "/merge-pdf" },
    { name: "Split PDF", href: "/split-pdf" },
    { name: "Compress PDF", href: "/compress-pdf" },
    { name: "PDF to Word", href: "/pdf-to-word" },
    { name: "Word to PDF", href: "/word-to-pdf" },
  ],
  Product: [
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "FAQ", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ],
  Legal: [
    { name: "Terms of Service", href: "/legal/terms" },
    { name: "Privacy Policy", href: "/legal/privacy" },
    { name: "Cookie Policy", href: "/legal/cookies" },
    { name: "Subscription Terms", href: "/legal/subscription" },
    { name: "Refund Policy", href: "/legal/refund" },
  ],
};

export function Footer() {
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
              The all-in-one PDF platform. Edit, sign, convert and organize PDFs
              online — no software installation required.
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
          <p>
            Secure processing · Files deleted after 2 hours · SSL encrypted
          </p>
          <div className="flex items-center gap-4">
            <Link href="/legal/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/legal/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
