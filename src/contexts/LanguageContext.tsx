"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type Locale,
  type Messages,
  locales,
  defaultLocale,
  setCookieLocale,
  getMessages,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  messages: Messages | null;
  setLocale: (locale: Locale) => void;
  t: <TSection extends keyof Messages>(section: TSection) => Messages[TSection];
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  messages: null,
  setLocale: () => {},
  t: () => ({}) as never,
});

function getLocaleFromUrl(): Locale | null {
  if (typeof window === "undefined") return null;
  const match = window.location.pathname.match(/^\/(en|es|fr|de|it|uk|ru)(\/|$)/);
  const val = match?.[1] as Locale | undefined;
  return val && locales.includes(val) ? val : null;
}

export function LanguageProvider({
  children,
  initialLocale = defaultLocale,
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    // Priority: URL slug > server-side cookie (initialLocale)
    const urlLocale = getLocaleFromUrl();
    const targetLocale = urlLocale ?? initialLocale;

    setLocaleState(targetLocale);

    // Sync cookie if URL locale differs from what the server knew
    if (urlLocale && urlLocale !== initialLocale) {
      setCookieLocale(urlLocale);
    }

    getMessages(targetLocale).then(setMessages);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setLocale = useCallback((newLocale: Locale) => {
    setCookieLocale(newLocale);
    setLocaleState(newLocale);
    getMessages(newLocale).then(setMessages);
  }, []);

  const t = useCallback(
    <TSection extends keyof Messages>(section: TSection): Messages[TSection] => {
      if (!messages) return {} as Messages[TSection];
      return messages[section];
    },
    [messages]
  );

  return (
    <LanguageContext.Provider value={{ locale, messages, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
