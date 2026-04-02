import { NextRequest, NextResponse } from "next/server";
import { PRICING } from "@/config/pricing";
import { SITE } from "@/config/seo";

export async function POST(req: NextRequest) {
  try {
    const { createCheckoutSession, createStripeCustomer } = await import("@/lib/stripe");
    const body = await req.json();
    const { priceId, couponCode, userEmail, userName } = body;

    const email = userEmail ?? "guest@docforge.app";
    const name  = userName  ?? "Guest User";

    const customer = await createStripeCustomer(email, name);

    const session = await createCheckoutSession({
      customerId: customer.id,
      priceId:    priceId ?? PRICING.monthly.stripePriceId,
      trialDays:  PRICING.trial.days,
      successUrl: `${SITE.url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:  `${SITE.url}/checkout?cancelled=true`,
      couponId:   couponCode ?? undefined,
      metadata:   { source: "web_checkout", userEmail: email },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("[create-checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
