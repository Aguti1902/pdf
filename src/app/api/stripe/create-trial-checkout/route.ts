import { NextRequest, NextResponse } from "next/server";
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";

/**
 * Creates a Stripe customer and a PaymentIntent for the trial fee (e.g. 0,50€).
 * setup_future_usage: "off_session" saves the card for recurring charges.
 */
export async function POST(req: NextRequest) {
  try {
    const { stripe, createStripeCustomer } = await import("@/lib/stripe");
    const body = await req.json();
    const { userEmail, userName, currency } = body;

    const email = userEmail ?? "guest@pdfcraft.online";
    const name  = userName  ?? "Guest User";

    const currencyCode: CurrencyCode = (currency && currency in CURRENCIES)
      ? (currency as CurrencyCode)
      : DEFAULT_CURRENCY;
    const currencyConfig = CURRENCIES[currencyCode];

    // Create (or reuse) customer
    const customer = await createStripeCustomer(email, name);

    // PaymentIntent for the trial fee — saves the payment method for future subscription charges
    const intent = await stripe.paymentIntents.create({
      amount:               Math.round(currencyConfig.trialAmount * 100),
      currency:             currencyCode.toLowerCase(),
      customer:             customer.id,
      setup_future_usage:   "off_session",
      description:          "PDFCraft — 2-Day Trial Access",
      metadata:             { type: "trial_fee", userEmail: email, currency: currencyCode },
      automatic_payment_methods: { enabled: true },
    });

    return NextResponse.json({
      clientSecret: intent.client_secret,
      customerId:   customer.id,
      currency:     currencyCode,
      trialAmount:  currencyConfig.trialLabel,
      monthlyAmount: currencyConfig.monthlyLabel,
    });
  } catch (err) {
    console.error("[create-trial-checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout." }, { status: 500 });
  }
}
