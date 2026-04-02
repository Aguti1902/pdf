"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { CURRENCIES, type CurrencyCode } from "@/config/pricing";
import { cn } from "@/lib/utils";

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (code: CurrencyCode) => void;
  className?: string;
}

export function CurrencySelector({ value, onChange, className }: CurrencySelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground transition hover:bg-muted focus:outline-none",
            className
          )}
        >
          <span>{CURRENCIES[value].flag}</span>
          <span>{value}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-44">
        {(Object.keys(CURRENCIES) as CurrencyCode[]).map((code) => (
          <DropdownMenuItem
            key={code}
            onClick={() => onChange(code)}
            className={cn(
              "flex items-center gap-2.5 cursor-pointer text-sm",
              code === value && "bg-accent font-semibold"
            )}
          >
            <span className="text-base">{CURRENCIES[code].flag}</span>
            <span className="font-medium">{code}</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {CURRENCIES[code].symbol}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
