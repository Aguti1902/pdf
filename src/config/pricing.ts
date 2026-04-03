// ─── Multi-currency pricing ──────────────────────────────────────────────────
// Amounts in the currency's major unit (e.g. EUR cents → 0.50 → 50 on Stripe)
// All trial amounts are real-value equivalents of €0.50.
// All monthly amounts are real-value equivalents of €49.90.
// Amounts verified against Stripe's minimum charge requirements (account settles in EUR).
export const CURRENCIES = {
  EUR: { symbol: "€",   flag: "🇪🇺", trialAmount: 0.50,  monthlyAmount: 49.90,
         trialLabel: "0,50 €",    monthlyLabel: "49,90 €"   },
  USD: { symbol: "$",   flag: "🇺🇸", trialAmount: 0.59,  monthlyAmount: 53.90,
         trialLabel: "$0.59",     monthlyLabel: "$53.90"    },
  GBP: { symbol: "£",   flag: "🇬🇧", trialAmount: 0.45,  monthlyAmount: 42.90,
         trialLabel: "£0.45",     monthlyLabel: "£42.90"    },
  BRL: { symbol: "R$",  flag: "🇧🇷", trialAmount: 2.99,  monthlyAmount: 299.90,
         trialLabel: "R$2,99",    monthlyLabel: "R$299,90"  },
  MXN: { symbol: "$",   flag: "🇲🇽", trialAmount: 11.00, monthlyAmount: 1099.00,
         trialLabel: "$11 MXN",   monthlyLabel: "$1.099 MXN" },
  CAD: { symbol: "CA$", flag: "🇨🇦", trialAmount: 0.80,  monthlyAmount: 79.90,
         trialLabel: "CA$0.80",   monthlyLabel: "CA$79.90"  },
  AUD: { symbol: "A$",  flag: "🇦🇺", trialAmount: 0.85,  monthlyAmount: 84.90,
         trialLabel: "A$0.85",    monthlyLabel: "A$84.90"   },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;
export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

// ─── Legacy PRICING (kept for backwards compat) ───────────────────────────────
export const PRICING = {
  trial: {
    price:    CURRENCIES.EUR.trialAmount,
    currency: "EUR",
    label:    CURRENCIES.EUR.trialLabel,
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
  summary: `Start your 2-day full access trial for just 0,50 €. After the trial period, your subscription automatically renews at 49,90 €/month until cancelled. Cancel anytime from your account before the trial ends to avoid charges.`,
  checkoutNotice: `By completing this purchase, you agree to the 2-day trial at 0,50 €, after which your subscription will automatically renews at 49,90 €/month until cancelled.`,
};
