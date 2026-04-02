import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({ email, name });
}

/**
 * Creates a Stripe Checkout Session implementing the trial model:
 *
 *  Day 0   → Customer pays trial fee (trialFeePrice or price_data, one-time)
 *  Day 0–7 → Full access during trial period
 *  Day 7   → First monthly charge (priceId or price_data recurring)
 *  Day 37  → Second charge, and so on until cancelled
 *
 * Pass `currencyPricing` to override the fixed EUR price IDs with
 * dynamic `price_data` for any supported currency.
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  trialFeePriceId,
  trialDays,
  successUrl,
  cancelUrl,
  couponId,
  metadata,
  currencyPricing,
}: {
  customerId:       string;
  priceId:          string;
  trialFeePriceId?: string;
  trialDays?:       number;
  successUrl:       string;
  cancelUrl:        string;
  couponId?:        string;
  metadata?:        Record<string, string>;
  /** When set, uses price_data instead of fixed price IDs (multi-currency) */
  currencyPricing?: { currency: string; trialAmount: number; monthlyAmount: number };
}) {
  // Build line item — either dynamic price_data (multi-currency) or fixed price ID (EUR default)
  const subscriptionLineItem = currencyPricing
    ? {
        price_data: {
          currency:     currencyPricing.currency.toLowerCase(),
          product_data: { name: "PDFCraft — Monthly Subscription" },
          recurring:    { interval: "month" as const },
          unit_amount:  Math.round(currencyPricing.monthlyAmount * 100),
        },
        quantity: 1,
      }
    : { price: priceId, quantity: 1 };

  // Build trial fee item (one-time charge at checkout)
  const trialFeeItem = currencyPricing
    ? [{
        price_data: {
          currency:     currencyPricing.currency.toLowerCase(),
          product_data: { name: `PDFCraft — ${trialDays ?? 2}-Day Trial` },
          unit_amount:  Math.round(currencyPricing.trialAmount * 100),
        },
        quantity: 1,
      }]
    : trialFeePriceId
    ? [{ price: trialFeePriceId, quantity: 1 }]
    : [];

  return stripe.checkout.sessions.create({
    customer:              customerId,
    mode:                  "subscription",
    payment_method_types:  ["card"],
    line_items:            [subscriptionLineItem],
    ...(trialFeeItem.length > 0 && { add_invoice_items: trialFeeItem }),
    subscription_data: {
      trial_period_days: trialDays,
      metadata:          metadata ?? {},
    },
    discounts:                   couponId ? [{ coupon: couponId }] : undefined,
    success_url:                 successUrl,
    cancel_url:                  cancelUrl,
    allow_promotion_codes:       !couponId,
    billing_address_collection:  "required",
    customer_update:             { address: "auto" },
    phone_number_collection:     { enabled: false },
    locale:                      "auto",
  });
}

export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  return stripe.billingPortal.sessions.create({ customer: customerId, return_url: returnUrl });
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method", "latest_invoice"],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });
}

export async function listInvoices(customerId: string) {
  return stripe.invoices.list({ customer: customerId, limit: 20 });
}

export function constructWebhookEvent(payload: string | Buffer, signature: string) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET ?? ""
  );
}
