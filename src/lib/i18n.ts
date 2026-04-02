export const locales = ["en", "es", "fr", "de", "it", "uk", "ru"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  it: "Italiano",
  uk: "Українська",
  ru: "Русский",
};

export const localeFlags: Record<Locale, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  it: "🇮🇹",
  uk: "🇺🇦",
  ru: "🇷🇺",
};

export type Messages = typeof import("../../messages/en.json");

const cache: Partial<Record<Locale, Messages>> = {};

export async function getMessages(locale: Locale): Promise<Messages> {
  if (cache[locale]) return cache[locale]!;
  try {
    const messages = (await import(`../../messages/${locale}.json`)) as Messages;
    cache[locale] = messages;
    return messages;
  } catch {
    const fallback = (await import("../../messages/en.json")) as Messages;
    cache[locale] = fallback;
    return fallback;
  }
}

export function getCookieLocale(): Locale {
  if (typeof document === "undefined") return defaultLocale;
  const match = document.cookie.match(/(?:^|;\s*)pdfcraft_locale=([^;]+)/);
  const val = match?.[1] as Locale | undefined;
  return val && locales.includes(val) ? val : defaultLocale;
}

export function setCookieLocale(locale: Locale) {
  document.cookie = `pdfcraft_locale=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}
