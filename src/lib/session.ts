import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "pdfcraft-jwt-secret-change-in-production-32chars"
);
const COOKIE = "pdfcraft_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  userId:  string;
  email:   string;
  name:    string | null;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(SECRET);
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Read session from server-side cookies (Server Components / Route Handlers) */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Read session from a NextRequest (middleware / route handlers) */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export function setSessionCookie(token: string): { name: string; value: string; httpOnly: boolean; sameSite: "lax"; path: string; maxAge: number; secure: boolean } {
  return {
    name:     COOKIE,
    value:    token,
    httpOnly: true,
    sameSite: "lax",
    path:     "/",
    maxAge:   MAX_AGE,
    secure:   process.env.NODE_ENV === "production",
  };
}

export function clearSessionCookie(): { name: string; value: string; maxAge: number; path: string } {
  return { name: COOKIE, value: "", maxAge: 0, path: "/" };
}
