export const PRICING = {
  trial: {
    price:    0.50,
    currency: "EUR",
    label:    "0,50 €",
    days:     7,
    // One-time 0,50€ fee charged at checkout start
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_TRIAL_FEE_PRICE_ID
      ?? "price_1THbL5JB5YYhafsNwzOUQWfl",
  },
  monthly: {
    price:           49.90,
    currency:        "EUR",
    label:           "49,90 €",
    billingInterval: "month",
    // Recurring 49,90€/month — billed after 7-day trial
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
  summary: `Start your 7-day full access trial for just 0,50 €. After the trial period, your subscription automatically renews at 49,90 €/month until cancelled. Cancel anytime from your account before the trial ends to avoid charges.`,
  checkoutNotice: `By completing this purchase, you agree to the 7-day trial at 0,50 €, after which your subscription will automatically renews at 49,90 €/month until cancelled.`,
};
