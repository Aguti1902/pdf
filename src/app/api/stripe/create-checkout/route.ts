import { NextRequest, NextResponse } from "next/server";
import { PRICING, CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { SITE } from "@/config/seo";

export async function POST(req: NextRequest) {
  try {
    const { createCheckoutSession, createStripeCustomer } = await import("@/lib/stripe");
    const body = await req.json();
    const { couponCode, userEmail, userName, currency } = body;

    const email = userEmail ?? "guest@pdfcraft.online";
    const name  = userName  ?? "Guest User";

    // Resolve currency config — fall back to EUR default
    const currencyCode: CurrencyCode = (currency && currency in CURRENCIES)
      ? (currency as CurrencyCode)
      : DEFAULT_CURRENCY;
    const currencyConfig = CURRENCIES[currencyCode];

    // For non-EUR currencies we use dynamic price_data; for EUR we use fixed price IDs
    const isDefaultCurrency = currencyCode === DEFAULT_CURRENCY;

    const customer = await createStripeCustomer(email, name);

    const session = await createCheckoutSession({
      customerId:      customer.id,
      // Fixed price IDs (EUR default) — used only when isDefaultCurrency
      priceId:         PRICING.monthly.stripePriceId,
      trialFeePriceId: PRICING.trial.stripePriceId,
      trialDays:       PRICING.trial.days,
      successUrl:      `${SITE.url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:       `${SITE.url}/checkout?cancelled=true`,
      couponId:        couponCode ?? undefined,
      metadata:        { source: "web_checkout", userEmail: email, currency: currencyCode },
      // Dynamic price_data for non-EUR currencies
      ...(!isDefaultCurrency && {
        currencyPricing: {
          currency:      currencyCode,
          trialAmount:   currencyConfig.trialAmount,
          monthlyAmount: currencyConfig.monthlyAmount,
        },
      }),
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[create-checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session." },
      { status: 500 }
    );
  }
}
