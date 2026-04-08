// ─── Multi-currency pricing ──────────────────────────────────────────────────
// Trial is FREE (€0) — card is required to start, subscription charges after trial.
// Monthly amounts are real-value equivalents of €49.90.
export const CURRENCIES = {
  EUR: { symbol: "€",   flag: "🇪🇺", trialAmount: 0,  monthlyAmount: 49.90,
         trialLabel: "GRATIS",     monthlyLabel: "49,90 €"   },
  USD: { symbol: "$",   flag: "🇺🇸", trialAmount: 0,  monthlyAmount: 53.90,
         trialLabel: "FREE",       monthlyLabel: "$53.90"    },
  GBP: { symbol: "£",   flag: "🇬🇧", trialAmount: 0,  monthlyAmount: 42.90,
         trialLabel: "FREE",       monthlyLabel: "£42.90"    },
  BRL: { symbol: "R$",  flag: "🇧🇷", trialAmount: 0,  monthlyAmount: 299.90,
         trialLabel: "GRÁTIS",     monthlyLabel: "R$299,90"  },
  MXN: { symbol: "$",   flag: "🇲🇽", trialAmount: 0,  monthlyAmount: 1099.00,
         trialLabel: "GRATIS",     monthlyLabel: "$1.099 MXN" },
  CAD: { symbol: "CA$", flag: "🇨🇦", trialAmount: 0,  monthlyAmount: 79.90,
         trialLabel: "FREE",       monthlyLabel: "CA$79.90"  },
  AUD: { symbol: "A$",  flag: "🇦🇺", trialAmount: 0,  monthlyAmount: 84.90,
         trialLabel: "FREE",       monthlyLabel: "A$84.90"   },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

// ─── Legacy PRICING (kept for backwards compat) ───────────────────────────────
export const PRICING = {
  trial: {
    price:    0,
    currency: "EUR",
    label:    "GRATIS",
    days:     2,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TRIAL_FEE_PRICE_ID
      ?? "price_1THbL5JB5YYhafsNwzOUQWfl",
  },
  monthly: {
    price:           CURRENCIES.EUR.monthlyAmount,
    currency:        "EUR",
    label:           CURRENCIES.EUR.monthlyLabel,
    billingInterval: "month",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID
      ?? "price_1THbL4JB5YYhafsNF5zeDuis",
  },
};

export const FEATURES = {
  premium: [
    "Unlimited PDF downloads",
    "Edit, sign & annotate PDFs",
    "Convert PDF to Word, JPG, PNG",
    "Merge, split & compress PDFs",
    "Fill & sign PDF forms",
    "Files up to 100MB",
    "Batch processing",
    "No watermarks",
    "Priority processing speed",
    "File history (30 days)",
    "Email support",
  ],
};

export const TRIAL_DISCLOSURE = {
  summary: `Empieza tu prueba gratuita de 2 días con acceso completo. Tras el período de prueba, tu suscripción se renueva automáticamente a 49,90 €/mes hasta que canceles. Cancela en cualquier momento desde tu cuenta antes de que termine el trial para no recibir cargos.`,
  checkoutNotice: `Al completar este registro, aceptas la prueba gratuita de 2 días, tras la cual tu suscripción se renueva automáticamente a 49,90 €/mes hasta que canceles.`,
};
