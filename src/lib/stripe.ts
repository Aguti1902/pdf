import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({ email, name });
}

/**
 * Creates a Stripe Checkout Session for the trial flow:
 * - Charges trialFeePrice (0,50€) immediately as an invoice item
 * - Creates a subscription to priceId (49,90€/month) starting after trialDays
 *
 * This means the customer pays 0,50€ today, gets 7 days of access,
 * then is billed 49,90€/month automatically.
 */
export async function createCheckoutSession({
  customerId,
  priceId,
  trialFeePrice,
  trialDays,
  successUrl,
  cancelUrl,
  couponId,
  metadata,
}: {
  customerId: string;
  priceId: string;
  trialFeePrice?: string;
  trialDays?: number;
  successUrl: string;
  cancelUrl: string;
  couponId?: string;
  metadata?: Record<string, string>;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    // Charge 0,50€ immediately as a setup fee (separate from the subscription)
    ...(trialFeePrice && {
      invoice_creation: undefined, // not needed with add_invoice_items
    }),
    subscription_data: {
      trial_period_days: trialDays,
      metadata: metadata ?? {},
    },
    // 0,50€ charged NOW on top of the subscription (which starts after trial)
    discounts: couponId ? [{ coupon: couponId }] : undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: !couponId,
    billing_address_collection: "required",
    customer_update: { address: "auto" },
    // Show trial + price breakdown clearly in Stripe's hosted page
    custom_text: {
      submit: {
        message: `By completing this purchase you agree to be charged ${trialFeePrice ? "0,50 € today" : "nothing today"}, then 49,90 €/month after 7 days. Cancel anytime.`,
      },
    },
  });
}

/**
 * Simplified checkout: just the monthly subscription with no trial fee.
 * Use when the user already paid the trial fee.
 */
export async function createSubscriptionCheckout({
  customerId,
  priceId,
  successUrl,
  cancelUrl,
}: {
  customerId: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
}) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    billing_address_collection: "required",
    customer_update: { address: "auto" },
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
  return stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET ?? "");
}
