import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null });

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where:  { id: session.userId },
      select: { id: true, email: true, name: true, stripeCustomerId: true,
        subscription: { select: { status: true, trialEnd: true, stripeCurrentPeriodEnd: true, stripeCancelAtPeriodEnd: true } } },
    });
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: { id: session.userId, email: session.email, name: session.name } });
  }
}
