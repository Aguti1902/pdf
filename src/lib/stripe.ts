import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2025-02-24.acacia",
  typescript: true,
});

export async function createStripeCustomer(email: string, name?: string) {
  return stripe.customers.create({ email, name });
}

export async function createCheckoutSession({
  customerId,
  priceId,
  trialDays,
  successUrl,
  cancelUrl,
  couponId,
  metadata,
}: {
  customerId: string;
  priceId: string;
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
    subscription_data: {
      trial_period_days: trialDays,
      metadata: metadata ?? {},
    },
    discounts: couponId ? [{ coupon: couponId }] : undefined,
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: !couponId,
    billing_address_collection: "required",
    customer_update: { address: "auto" },
  });
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
}

export async function getSubscription(subscriptionId: string) {
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["default_payment_method", "latest_invoice"],
  });
}

export async function cancelSubscription(subscriptionId: string) {
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

export async function listInvoices(customerId: string) {
  return stripe.invoices.list({ customer: customerId, limit: 20 });
}

export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET ?? ""
  );
}
