import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, createSession, setSessionCookie } from "@/lib/session";

export async function GET(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null });

  try {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where:  { id: session.userId },
      select: { id: true, email: true, name: true, avatarUrl: true, stripeCustomerId: true,
        subscription: { select: { status: true, trialEnd: true, stripeCurrentPeriodEnd: true, stripeCancelAtPeriodEnd: true } } },
    });
    if (!user) return NextResponse.json({ user: null });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: { id: session.userId, email: session.email, name: session.name } });
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, email } = await req.json();
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.update({
      where:  { id: session.userId },
      data:   { name: name ?? undefined, email: email ?? undefined },
      select: { id: true, email: true, name: true },
    });
    // Refresh session cookie with updated data
    const token = await createSession({ userId: user.id, email: user.email, name: user.name });
    const c = setSessionCookie(token);
    const res = NextResponse.json({ user });
    res.cookies.set(c.name, c.value, c);
    return res;
  } catch (err) {
    console.error("[auth/me PATCH]", err);
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}
