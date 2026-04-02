import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json({ error: "Google OAuth not configured." }, { status: 500 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  // CSRF state: encode optional redirect destination
  const searchParams = req.nextUrl.searchParams;
  const redirectTo = searchParams.get("redirect") ?? "/dashboard";
  const state = Buffer.from(
    JSON.stringify({ csrf: randomBytes(16).toString("hex"), redirectTo })
  ).toString("base64url");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  });

  const response = NextResponse.redirect(`${GOOGLE_AUTH_URL}?${params}`);
  // Store state in cookie for CSRF check
  response.cookies.set("google_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 10, // 10 min
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
