import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { name, email, password } = await req.json();

    if (!email || !password) return NextResponse.json({ error: "Email and password required." }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered." }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name: name ?? null, email, passwordHash },
    });

    const token = await createSession({ userId: user.id, email: user.email, name: user.name });
    const res   = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    const c     = setSessionCookie(token);
    res.cookies.set(c.name, c.value, c);
    return res;
  } catch (err) {
    console.error("[auth/register]", err);
    return NextResponse.json({ error: "Registration failed." }, { status: 500 });
  }
}
