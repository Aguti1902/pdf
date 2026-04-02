import { NextRequest, NextResponse } from "next/server";
import { PRICING, CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { SITE } from "@/config/seo";

export async function POST(req: NextRequest) {
  try {
    const { createEmbeddedCheckoutSession, createStripeCustomer } = await import("@/lib/stripe");
    const body = await req.json();
    const { userEmail, userName, currency } = body;

    const email = userEmail ?? "guest@pdfcraft.online";
    const name  = userName  ?? "Guest User";

    const currencyCode: CurrencyCode = (currency && currency in CURRENCIES)
      ? (currency as CurrencyCode)
      : DEFAULT_CURRENCY;
    const currencyConfig = CURRENCIES[currencyCode];
    const isDefaultCurrency = currencyCode === DEFAULT_CURRENCY;

    const customer = await createStripeCustomer(email, name);

    const session = await createEmbeddedCheckoutSession({
      customerId: customer.id,
      priceId:    PRICING.monthly.stripePriceId,
      trialDays:  PRICING.trial.days,
      returnUrl:       `${SITE.url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      metadata:        { source: "web_embedded", userEmail: email, currency: currencyCode },
      ...(!isDefaultCurrency && {
        currencyPricing: {
          currency:      currencyCode,
          trialAmount:   currencyConfig.trialAmount,
          monthlyAmount: currencyConfig.monthlyAmount,
        },
      }),
    });

    return NextResponse.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("[create-embedded-checkout]", err);
    return NextResponse.json(
      { error: "Failed to create embedded checkout session." },
      { status: 500 }
    );
  }
}
