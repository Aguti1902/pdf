import { NextRequest, NextResponse } from "next/server";
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";

/**
 * Creates (or reuses) a Stripe customer and a PaymentIntent for the trial fee.
 * Pass `customerId` to reuse an existing customer (e.g. on currency change).
 * setup_future_usage: "off_session" saves the card for recurring subscription charges.
 */
export async function POST(req: NextRequest) {
  try {
    const { stripe, createStripeCustomer } = await import("@/lib/stripe");
    const body = await req.json();
    const { userEmail, userName, currency, customerId: existingCustomerId } = body;

    const email = userEmail ?? "guest@pdfcraft.online";
    const name  = userName  ?? "Guest User";

    const currencyCode: CurrencyCode = (currency && currency in CURRENCIES)
      ? (currency as CurrencyCode)
      : DEFAULT_CURRENCY;
    const currencyConfig = CURRENCIES[currencyCode];

    // Reuse existing customer if provided, otherwise create a new one
    let customerId: string;
    if (existingCustomerId) {
      customerId = existingCustomerId;
    } else {
      const customer = await createStripeCustomer(email, name);
      customerId = customer.id;
    }

    // PaymentIntent for the trial fee
    const intent = await stripe.paymentIntents.create({
      amount:             Math.round(currencyConfig.trialAmount * 100),
      currency:           currencyCode.toLowerCase(),
      customer:           customerId,
      setup_future_usage: "off_session",
      description:        "PDFCraft — 2-Day Trial Access",
      metadata:           { type: "trial_fee", userEmail: email, currency: currencyCode },
      payment_method_types: ["card"],
    });

    return NextResponse.json({
      clientSecret:  intent.client_secret,
      customerId,
      currency:      currencyCode,
      trialAmount:   currencyConfig.trialLabel,
      monthlyAmount: currencyConfig.monthlyLabel,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[create-trial-checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
