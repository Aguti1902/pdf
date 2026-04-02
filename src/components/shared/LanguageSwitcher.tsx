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
import { locales, localeLabels, localeFlags, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useLanguage();

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
            onClick={() => setLocale(l)}
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
