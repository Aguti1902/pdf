import { NextRequest, NextResponse } from "next/server";
import { CURRENCIES, DEFAULT_CURRENCY, type CurrencyCode } from "@/config/pricing";
import { getSessionFromRequest } from "@/lib/session";

/**
 * POST /api/stripe/create-trial-checkout
 *
 * Creates a Stripe SetupIntent (€0 charge) to collect the customer's payment method.
 * The actual subscription charge starts after the trial period ends.
 *
 * Returns: { clientSecret, customerId, type: "setup" }
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

    // Create a SetupIntent to collect the card without charging.
    // The subscription (with trial) will be created after the card is saved.
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
      usage: "off_session", // Allow future charges (subscription renewals)
      metadata: {
        source:   "web_free_trial",
        currency: currencyCode,
        email,
      },
    });

    return NextResponse.json({
      clientSecret: setupIntent.client_secret,
      customerId,
      type: "setup", // Let the client know this is a SetupIntent
    });
  } catch (err) {
    console.error("[create-trial-checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
