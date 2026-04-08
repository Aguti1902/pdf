import { NextRequest, NextResponse } from "next/server";
import { PRICING, CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { SITE } from "@/config/seo";

/**
 * Called after the trial PaymentIntent is confirmed on the client.
 * Creates a recurring subscription with a 2-day trial period using
 * the payment method saved by the PaymentIntent.
 */
export async function POST(req: NextRequest) {
  try {
    const { stripe } = await import("@/lib/stripe");
    const body = await req.json();
    const { customerId, paymentMethodId, currency, paymentIntentId, setupIntentId } = body;

    if (!customerId || !paymentMethodId) {
      return NextResponse.json({ error: "Missing customerId or paymentMethodId" }, { status: 400 });
    }

    const currencyCode: CurrencyCode = (currency && currency in CURRENCIES)
      ? (currency as CurrencyCode)
      : DEFAULT_CURRENCY;
    const currencyConfig = CURRENCIES[currencyCode];
    const isDefaultCurrency = currencyCode === DEFAULT_CURRENCY;

    // Set the payment method as the customer's default
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    // Build the subscription line item
    const lineItem = isDefaultCurrency
      ? ({ price: PRICING.monthly.stripePriceId, quantity: 1 } as const)
      : ({
          price_data: {
            currency:     currencyCode.toLowerCase(),
            product_data: { name: "PDFCraft Premium" },
            recurring:    { interval: "month" as const },
            unit_amount:  Math.round(currencyConfig.monthlyAmount * 100),
          },
          quantity: 1,
        } as const);

    const subscription = await stripe.subscriptions.create({
      customer:               customerId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items:                  [lineItem] as any,
      default_payment_method: paymentMethodId,
      trial_period_days:      PRICING.trial.days,
      metadata: {
        source:          "web_free_trial",
        setupIntentId:   setupIntentId   ?? paymentIntentId ?? "",
        currency:        currencyCode,
      },
    });

    // Update user subscription in DB (same logic as webhook)
    try {
      const { getSessionFromRequest } = await import("@/lib/session");
      const session = await getSessionFromRequest(req);
      if (session?.userId) {
        const { prisma } = await import("@/lib/prisma");
        const periodEnd = new Date((subscription.current_period_end ?? 0) * 1000);
        await prisma.user.update({
          where: { id: session.userId },
          data:  { stripeCustomerId: customerId },
        });
        const now = new Date();
        await prisma.subscription.upsert({
          where:  { userId: session.userId },
          create: {
            userId:                    session.userId,
            stripeCustomerId:          customerId,
            stripeSubscriptionId:      subscription.id,
            stripePriceId:             PRICING.monthly.stripePriceId,
            stripeCurrentPeriodStart:  now,
            stripeCurrentPeriodEnd:    periodEnd,
            status:                    "trialing",
          },
          update: {
            stripeCustomerId:          customerId,
            stripeSubscriptionId:      subscription.id,
            stripePriceId:             PRICING.monthly.stripePriceId,
            stripeCurrentPeriodStart:  now,
            stripeCurrentPeriodEnd:    periodEnd,
            status:                    "trialing",
          },
        });
      }
    } catch { /* ignore — webhook will sync as backup */ }

    return NextResponse.json({
      subscriptionId: subscription.id,
      status:         subscription.status,
      redirectUrl:    `${SITE.url}/dashboard?checkout=success`,
    });
  } catch (err) {
    console.error("[activate-subscription]", err);
    return NextResponse.json({ error: "Failed to activate subscription." }, { status: 500 });
  }
}
