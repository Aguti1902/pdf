import { NextRequest, NextResponse } from "next/server";
import { PRICING } from "@/config/pricing";
import { SITE } from "@/config/seo";

export async function POST(req: NextRequest) {
  try {
    const { createCheckoutSession, createStripeCustomer } = await import("@/lib/stripe");
    const body = await req.json();
    const { couponCode, userEmail, userName } = body;

    const email = userEmail ?? "guest@pdfcraft.online";
    const name  = userName  ?? "Guest User";

    const customer = await createStripeCustomer(email, name);

    const session = await createCheckoutSession({
      customerId:      customer.id,
      priceId:         PRICING.monthly.stripePriceId,       // 49,90€/month (after trial)
      trialFeePriceId: PRICING.trial.stripePriceId,          // 0,50€ charged today
      trialDays:       PRICING.trial.days,                   // 7 days free after paying 0,50€
      successUrl:      `${SITE.url}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl:       `${SITE.url}/checkout?cancelled=true`,
      couponId:        couponCode ?? undefined,
      metadata:        { source: "web_checkout", userEmail: email },
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
