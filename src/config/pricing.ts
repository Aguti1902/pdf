export const PRICING = {
  trial: {
    price: 0.50,
    currency: "EUR",
    label: "0,50 €",
    days: 7,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TRIAL_PRICE_ID ?? "price_trial",
  },
  monthly: {
    price: 49.90,
    currency: "EUR",
    label: "49,90 €",
    billingInterval: "month",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID ?? "price_monthly",
  },
  yearly: {
    price: 359.00,
    currency: "EUR",
    label: "359,00 €",
    billingInterval: "year",
    savings: "40%",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID ?? "price_yearly",
  },
};

// No free tier — all downloads require subscription
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
    "Advanced OCR for scanned PDFs",
    "File history (30 days)",
    "Email support",
  ],
};

export const TRIAL_DISCLOSURE = {
  summary: `Start your 7-day full access trial for just 0,50 €. After the trial period, your subscription automatically renews at 49,90 €/month until cancelled. Cancel anytime from your account before the trial ends to avoid charges.`,
  checkoutNotice: `By completing this purchase, you agree to the 7-day trial at 0,50 €, after which your subscription will automatically renew at 49,90 €/month until cancelled.`,
};
