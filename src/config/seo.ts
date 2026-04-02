export const SITE = {
  name: "PDFCraft",
  tagline: "Edit, Sign & Convert PDFs Online",
  description:
    "PDFCraft is the all-in-one PDF platform. Edit, sign, convert, compress and organize PDF files online — no software needed. Fast, secure, and built for everyone.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "https://pdfcraft.online",
  ogImage: "/og-image.png",
  twitter: "@pdfcraftonline",
  supportEmail: "support@pdfcraft.online",
  legalEmail: "legal@pdfcraft.online",
  companyName: "PDFCraft Ltd.",
  companyAddress: "123 Market Street, San Francisco, CA 94105",
};

export const DEFAULT_METADATA = {
  title: {
    default: `${SITE.name} – ${SITE.tagline}`,
    template: `%s | ${SITE.name}`,
  },
  description: SITE.description,
  metadataBase: new URL(SITE.url),
  openGraph: {
    type: "website" as const,
    siteName: SITE.name,
    images: [{ url: SITE.ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image" as const,
    site: SITE.twitter,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export const BRAND = {
  primaryColor: "#2563EB",
  accentColor: "#06B6D4",
  fontHeading: "Cal Sans, Inter, sans-serif",
  fontBody: "Inter, sans-serif",
};
