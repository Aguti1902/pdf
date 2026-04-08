import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

/**
 * POST /api/stripe/cancel-subscription
 * Body: { action: "cancel" | "reactivate" }
 *
 * "cancel"     → sets cancel_at_period_end = true  (keeps access until period end)
 * "reactivate" → sets cancel_at_period_end = false (resumes auto-renewal)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionFromRequest(req);
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await req.json();
    if (action !== "cancel" && action !== "reactivate") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { prisma } = await import("@/lib/prisma");
    const { stripe }  = await import("@/lib/stripe");

    const sub = await prisma.subscription.findFirst({
      where:   { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    if (!sub?.stripeSubscriptionId) {
      return NextResponse.json({ error: "No active subscription found." }, { status: 404 });
    }

    const cancelAtPeriodEnd = action === "cancel";

    await stripe.subscriptions.update(sub.stripeSubscriptionId, {
      cancel_at_period_end: cancelAtPeriodEnd,
    });

    await prisma.subscription.update({
      where: { id: sub.id },
      data:  { stripeCancelAtPeriodEnd: cancelAtPeriodEnd },
    });

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd,
      message: cancelAtPeriodEnd
        ? "Subscription will cancel at the end of the current period."
        : "Subscription renewal reactivated.",
    });
  } catch (err) {
    console.error("[cancel-subscription]", err);
    return NextResponse.json({ error: "Failed to update subscription." }, { status: 500 });
  }
}
