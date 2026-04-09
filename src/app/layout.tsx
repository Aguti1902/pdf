import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEFAULT_METADATA } from "@/config/seo";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CheckoutTrigger } from "@/components/checkout/CheckoutTrigger";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { locales, defaultLocale } from "@/lib/i18n";

const GA_ID  = "G-BQ6J81C260";
const ADS_ID = "AW-18057514661";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  ...DEFAULT_METADATA,
  title: DEFAULT_METADATA.title,
  description: DEFAULT_METADATA.description,
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/icon.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read locale from cookie server-side to avoid flash of wrong language
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get("pdfcraft_locale")?.value as Locale | undefined;
  const initialLocale: Locale = rawLocale && locales.includes(rawLocale) ? rawLocale : defaultLocale;

  return (
    <html lang={initialLocale} suppressHydrationWarning>
      <head>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`}
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
            gtag('config', '${ADS_ID}');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <LanguageProvider initialLocale={initialLocale}>
          <TooltipProvider>
            {children}
            <CheckoutTrigger />
            <Toaster position="bottom-right" richColors />
          </TooltipProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
