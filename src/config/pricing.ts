export const PRICING = {
  trial: {
    price: 0.99,
    currency: "USD",
    label: "$0.99",
    days: 7,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TRIAL_PRICE_ID ?? "price_trial",
  },
  monthly: {
    price: 9.99,
    currency: "USD",
    label: "$9.99",
    billingInterval: "month",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "price_monthly",
  },
  yearly: {
    price: 79.99,
    currency: "USD",
    label: "$79.99",
    billingInterval: "year",
    savings: "33%",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ?? "price_yearly",
  },
};

export const FEATURES = {
  free: [
    "Upload and preview PDFs",
    "Try all editing tools",
    "Basic annotations",
    "1 download per day",
    "Max 5MB file size",
  ],
  premium: [
    "Unlimited downloads",
    "Up to 100MB file size",
    "Batch processing",
    "No watermarks",
    "Priority processing",
    "Advanced OCR",
    "File history (30 days)",
    "Email support",
    "API access (coming soon)",
  ],
};

export const TRIAL_DISCLOSURE = {
  summary: `Start your 7-day trial for $0.99. After the trial period ends, your plan automatically renews at $9.99/month. You can cancel anytime from your account dashboard before the trial ends to avoid charges. No refunds on the trial fee.`,
  checkoutNotice: `By completing this purchase, you agree to the ${PRICING.trial.days}-day trial at ${PRICING.trial.label}, after which your subscription will automatically renew at ${PRICING.monthly.label}/month until cancelled.`,
};
