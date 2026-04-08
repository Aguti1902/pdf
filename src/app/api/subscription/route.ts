import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ status: "unauthenticated", isPremium: false });

  try {
    const { prisma } = await import("@/lib/prisma");
    const sub = await prisma.subscription.findFirst({
      where:   { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    if (!sub) return NextResponse.json({ status: "free", isPremium: false });

    const now = new Date();

    // Validate dates: a "trialing" sub with trialEnd in the past is NOT premium.
    // An "active" sub with stripeCurrentPeriodEnd in the past is NOT premium.
    // This guards against delayed Stripe webhooks that haven't updated the status yet.
    const trialExpired  = sub.trialEnd              ? sub.trialEnd              < now : false;
    const periodExpired = sub.stripeCurrentPeriodEnd ? sub.stripeCurrentPeriodEnd < now : false;

    const isPremium =
      (sub.status === "trialing" && !trialExpired) ||
      (sub.status === "active"   && !periodExpired);

    // Also expose whether the user ever had a subscription (for paywall copy)
    const hadSubscription = ["active", "trialing", "canceled", "past_due"].includes(sub.status);

    return NextResponse.json({
      status:           sub.status,
      isPremium,
      hadSubscription,
      trialEnd:         sub.trialEnd?.toISOString() ?? null,
      currentPeriodEnd: sub.stripeCurrentPeriodEnd.toISOString(),
      cancelAtPeriodEnd:sub.stripeCancelAtPeriodEnd,
    });
  } catch {
    return NextResponse.json({ status: "free", isPremium: false });
  }
}
