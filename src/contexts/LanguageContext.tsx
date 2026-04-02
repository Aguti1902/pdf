"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  type Locale,
  type Messages,
  defaultLocale,
  getCookieLocale,
  setCookieLocale,
  getMessages,
} from "@/lib/i18n";

interface LanguageContextValue {
  locale: Locale;
  messages: Messages | null;
  setLocale: (locale: Locale) => void;
  t: <TSection extends keyof Messages>(
    section: TSection
  ) => Messages[TSection];
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: defaultLocale,
  messages: null,
  setLocale: () => {},
  t: () => ({}) as never,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [messages, setMessages] = useState<Messages | null>(null);

  useEffect(() => {
    const detected = getCookieLocale();
    setLocaleState(detected);
    getMessages(detected).then(setMessages);
  }, []);

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
