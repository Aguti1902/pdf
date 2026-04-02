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

    const isPremium = sub.status === "active" || sub.status === "trialing";
    return NextResponse.json({
      status:             sub.status,
      isPremium,
      trialEnd:           sub.trialEnd?.toISOString() ?? null,
      currentPeriodEnd:   sub.stripeCurrentPeriodEnd.toISOString(),
      cancelAtPeriodEnd:  sub.stripeCancelAtPeriodEnd,
    });
  } catch {
    return NextResponse.json({ status: "free", isPremium: false });
  }
}
