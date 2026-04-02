"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Globe } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { locales, localeLabels, localeFlags, setCookieLocale, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale } = useLanguage();
  const pathname = usePathname();

  const handleSelect = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Strip any existing locale prefix from the current pathname
    let cleanPath = pathname ?? "/";
    for (const l of locales) {
      if (cleanPath === `/${l}` || cleanPath.startsWith(`/${l}/`)) {
        cleanPath = cleanPath.slice(l.length + 1) || "/";
        break;
      }
    }

    // Set cookie BEFORE navigating so the server-side layout reads it on reload
    setCookieLocale(newLocale);

    // Navigate to slug URL — full page reload so root layout re-runs with new cookie
    const target = newLocale === "en" ? cleanPath : `/${newLocale}${cleanPath}`;
    window.location.href = target;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("gap-1.5 text-sm", compact && "px-2")}
        >
          <Globe className="h-3.5 w-3.5 opacity-70" />
          {!compact && (
            <span className="hidden sm:inline">{localeFlags[locale]} {localeLabels[locale]}</span>
          )}
          {compact && <span>{localeFlags[locale]}</span>}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {locales.map((l: Locale) => (
          <DropdownMenuItem
            key={l}
            onClick={() => handleSelect(l)}
            className={cn(
              "flex items-center gap-2 cursor-pointer",
              l === locale && "bg-accent font-medium"
            )}
          >
            <span className="text-base">{localeFlags[l]}</span>
            <span>{localeLabels[l]}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
