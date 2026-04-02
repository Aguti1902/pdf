import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  const c   = clearSessionCookie();
  res.cookies.set(c.name, c.value, { maxAge: 0, path: c.path });
  return res;
}
