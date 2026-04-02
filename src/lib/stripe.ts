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
 *  Day 0  → Customer pays 0,50€ (trialFeePrice, one-time invoice item)
 *  Day 0–7 → Full access during trial period
 *  Day 7  → First monthly charge of 49,90€ (priceId, recurring)
 *  Day 37 → Second charge, and so on until cancelled
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
}: {
  customerId:      string;
  priceId:         string;
  trialFeePriceId?: string;
  trialDays?:      number;
  successUrl:      string;
  cancelUrl:       string;
  couponId?:       string;
  metadata?:       Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    customer:              customerId,
    mode:                  "subscription",
    payment_method_types:  ["card"],

    // Recurring subscription (49,90€/month, starts after trial)
    line_items: [{ price: priceId, quantity: 1 }],

    // One-time 0,50€ trial fee — charged immediately at checkout
    ...(trialFeePriceId && {
      add_invoice_items: [{ price: trialFeePriceId, quantity: 1 }],
    }),

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
