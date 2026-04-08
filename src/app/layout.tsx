import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { DEFAULT_METADATA } from "@/config/seo";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CheckoutTrigger } from "@/components/checkout/CheckoutTrigger";
import { cookies } from "next/headers";
import type { Locale } from "@/lib/i18n";
import { locales, defaultLocale } from "@/lib/i18n";

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
