import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

export const runtime = "nodejs";

// Stripe sends the raw body — we MUST NOT parse it before signature check
export async function POST(req: NextRequest) {
  const payload   = await req.text();
  const signature = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    const { constructWebhookEvent } = await import("@/lib/stripe");
    event = constructWebhookEvent(payload, signature);
  } catch (err) {
    console.error("[webhook] Signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  // Idempotency — skip if already processed
  try {
    const { prisma } = await import("@/lib/prisma");
    const existing = await prisma.stripeEvent.findUnique({ where: { id: event.id } });
    if (existing) {
      console.log("[webhook] Skipping duplicate event:", event.id);
      return NextResponse.json({ received: true });
    }

    console.log("[webhook] Processing event:", event.type, event.id);

    switch (event.type) {

      // ── User completes the checkout (pays 0,50 € trial fee) ─────────────────
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId   = session.customer as string;
        const customerEmail = session.customer_details?.email ?? "";
        const subscriptionId = session.subscription as string | null;

        console.log("[webhook] checkout.session.completed", {
          customerId, customerEmail, subscriptionId,
        });

        // Find or create user by email
        if (customerEmail) {
          const user = await prisma.user.upsert({
            where: { email: customerEmail },
            update: { stripeCustomerId: customerId },
            create: {
              email: customerEmail,
              name:  session.customer_details?.name ?? customerEmail.split("@")[0],
              stripeCustomerId: customerId,
            },
          });

          // Link subscription if already created by Stripe
          if (subscriptionId) {
            await prisma.subscription.upsert({
              where: { stripeSubscriptionId: subscriptionId },
              update: { userId: user.id, stripeCustomerId: customerId },
              create: {
                userId:               user.id,
                stripeCustomerId:     customerId,
                stripeSubscriptionId: subscriptionId,
                status:               "trialing",
                stripePriceId:        "",
                stripeCurrentPeriodStart: new Date(),
                stripeCurrentPeriodEnd:   new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                trialEnd:             new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            });
          }
        }
        break;
      }

      // ── Subscription created / updated (status changes, renewals…) ──────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        // Try to find the user by Stripe customer ID
        const user = await prisma.user.findFirst({ where: { stripeCustomerId: customerId } });

        await prisma.subscription.upsert({
          where: { stripeSubscriptionId: sub.id },
          update: {
            status:                   sub.status,
            stripePriceId:            sub.items.data[0]?.price.id ?? "",
            stripeCurrentPeriodStart: new Date(sub.current_period_start * 1000),
            stripeCurrentPeriodEnd:   new Date(sub.current_period_end   * 1000),
            stripeCancelAtPeriodEnd:  sub.cancel_at_period_end,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
          create: {
            userId:               user?.id ?? "unknown",
            stripeCustomerId:     customerId,
            stripeSubscriptionId: sub.id,
            status:               sub.status,
            stripePriceId:        sub.items.data[0]?.price.id ?? "",
            stripeCurrentPeriodStart: new Date(sub.current_period_start * 1000),
            stripeCurrentPeriodEnd:   new Date(sub.current_period_end   * 1000),
            stripeCancelAtPeriodEnd:  sub.cancel_at_period_end,
            trialEnd: sub.trial_end ? new Date(sub.trial_end * 1000) : null,
          },
        });

        console.log("[webhook] Subscription upserted:", sub.id, sub.status);
        break;
      }

      // ── Subscription cancelled ───────────────────────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: sub.id },
          data:  { status: "canceled", stripeCancelAtPeriodEnd: true },
        });
        console.log("[webhook] Subscription cancelled:", sub.id);
        break;
      }

      // ── Invoice paid (monthly renewal) ──────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice      = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as { subscription?: string }).subscription ?? "";
        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data:  { status: "active" },
          });
        }
        console.log("[webhook] Invoice paid for subscription:", subscriptionId);
        break;
      }

      // ── Payment failed ───────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice      = event.data.object as Stripe.Invoice;
        const subscriptionId = (invoice as { subscription?: string }).subscription ?? "";
        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data:  { status: "past_due" },
          });
        }
        console.log("[webhook] Payment failed for subscription:", subscriptionId);
        break;
      }

      default:
        console.log("[webhook] Unhandled event type:", event.type);
    }

    // Mark event as processed
    await prisma.stripeEvent.create({
      data: {
        id:       event.id,
        type:     event.type,
        livemode: event.livemode,
        data:     event.data as never,
      },
    });

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error("[webhook] Handler error:", err);
    return NextResponse.json({ error: "Webhook handler error." }, { status: 500 });
  }
}
