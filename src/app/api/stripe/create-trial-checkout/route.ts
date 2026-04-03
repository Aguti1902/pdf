import { NextRequest, NextResponse } from "next/server";
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { getSessionFromRequest } from "@/lib/session";

/**
 * Creates (or reuses) a Stripe customer and a PaymentIntent for the trial fee.
 * Resolves the real user email/customerId from the session when available,
 * so the Stripe customer is always linked to the logged-in user.
 */
export async function POST(req: NextRequest) {
  try {
    const { stripe, createStripeCustomer } = await import("@/lib/stripe");
    const { prisma } = await import("@/lib/prisma");
    const body = await req.json();
    const { userEmail: bodyEmail, userName: bodyName, currency, customerId: existingCustomerId } = body;

    // Prefer session data over whatever the client sends
    const session = await getSessionFromRequest(req);
    let email = bodyEmail as string | undefined;
    let name  = bodyName  as string | undefined;
    let dbCustomerId: string | undefined;

    if (session?.userId) {
      try {
        const dbUser = await prisma.user.findUnique({
          where:  { id: session.userId },
          select: { email: true, name: true, stripeCustomerId: true },
        });
        if (dbUser) {
          email        = dbUser.email ?? email;
          name         = dbUser.name  ?? name;
          dbCustomerId = dbUser.stripeCustomerId ?? undefined;
        }
      } catch { /* ignore, fall through to body values */ }
    }

    email = email || "guest@pdfcraft.online";
    name  = name  || "Guest User";

    const currencyCode: CurrencyCode = (currency && currency in CURRENCIES)
      ? (currency as CurrencyCode)
      : DEFAULT_CURRENCY;
    const currencyConfig = CURRENCIES[currencyCode];

    // Priority: 1) explicit customerId from body (currency change), 2) existing DB customer, 3) new customer
    let customerId: string;
    if (existingCustomerId) {
      customerId = existingCustomerId;
    } else if (dbCustomerId) {
      customerId = dbCustomerId;
    } else {
      const customer = await createStripeCustomer(email, name);
      customerId = customer.id;
    }

    // PaymentIntent for the trial fee
    const intent = await stripe.paymentIntents.create({
      amount:               Math.round(currencyConfig.trialAmount * 100),
      currency:             currencyCode.toLowerCase(),
      customer:             customerId,
      setup_future_usage:   "off_session",
      description:          "PDFCraft — 2-Day Trial Access",
      metadata:             { type: "trial_fee", userEmail: email, currency: currencyCode },
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
