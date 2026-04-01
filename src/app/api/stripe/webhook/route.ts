import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const payload = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  try {
    const { constructWebhookEvent } = await import("@/lib/stripe");
    const { prisma } = await import("@/lib/prisma");
    const event = constructWebhookEvent(payload, signature);

    const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing) return NextResponse.json({ received: true });

    // Handle events
    switch (event.type) {
      case "checkout.session.completed":
        console.log("[webhook] checkout.session.completed");
        break;
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: sub.id },
          update: {
            status: sub.status,
            stripePriceId: sub.items.data[0]?.price.id ?? "",
            stripeCurrentPeriodStart: new Date(sub.current_period_start * 1000),
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
            stripeCancelAtPeriodEnd: sub.cancel_at_period_end,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
          create: {
            userId: "placeholder",
            stripeSubscriptionId: sub.id,
            status: sub.status,
            stripePriceId: sub.items.data[0]?.price.id ?? "",
            stripeCurrentPeriodStart: new Date(sub.current_period_start * 1000),
            stripeCurrentPeriodEnd: new Date(sub.current_period_end * 1000),
            stripeCancelAtPeriodEnd: sub.cancel_at_period_end,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });
        break;
      }
      case "customer.subscription.deleted": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = event.data.object as any;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data: { status: "canceled" },
        });
        break;
      }
      default:
        break;
    }

    await prisma.stripeEvent.create({
      data: {
        id: event.id,
        type: event.type,
        livemode: event.livemode,
        data: event.data as never,
      },
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[webhook]", err);
    return NextResponse.json({ error: "Webhook error." }, { status: 400 });
  }
}
