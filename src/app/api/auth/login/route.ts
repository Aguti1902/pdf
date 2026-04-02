import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSession, setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { prisma } = await import("@/lib/prisma");
    const { email, password } = await req.json();

    if (!email || !password) return NextResponse.json({ error: "Email and password required." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const token = await createSession({ userId: user.id, email: user.email, name: user.name });
    const res   = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    const c     = setSessionCookie(token);
    res.cookies.set(c.name, c.value, c);
    return res;
  } catch (err) {
    console.error("[auth/login]", err);
    return NextResponse.json({ error: "Login failed." }, { status: 500 });
  }
}
