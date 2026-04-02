import { NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/session";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo";

interface GoogleUserInfo {
  sub: string;        // Google user ID
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export async function GET(req: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/login?error=google_denied`);
  }

  // CSRF check
  const storedState = req.cookies.get("google_oauth_state")?.value;
  if (!state || state !== storedState) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  // Decode redirectTo from state
  let redirectTo = "/dashboard";
  try {
    const decoded = JSON.parse(Buffer.from(state, "base64url").toString());
    redirectTo = decoded.redirectTo ?? "/dashboard";
  } catch { /* ignore */ }

  const clientId = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri = `${appUrl}/api/auth/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch(GOOGLE_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      console.error("[google/callback] token error", tokenData);
      return NextResponse.redirect(`${appUrl}/login?error=token_exchange`);
    }

    // Get user info
    const userRes = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const googleUser: GoogleUserInfo = await userRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(`${appUrl}/login?error=no_email`);
    }

    // Find or create user
    const { prisma } = await import("@/lib/prisma");
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { googleId: googleUser.sub },
          { email: googleUser.email },
        ],
      },
    });

    if (!user) {
      // New user — create account
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.sub,
          avatarUrl: googleUser.picture ?? null,
          emailVerified: googleUser.email_verified,
          emailVerifiedAt: googleUser.email_verified ? new Date() : null,
        },
      });
    } else if (!user.googleId) {
      // Existing email account — link Google
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.sub,
          avatarUrl: user.avatarUrl ?? googleUser.picture ?? null,
          emailVerified: true,
          emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        },
      });
    }

    // Create JWT session cookie
    const token = await createSession({ userId: user.id, email: user.email, name: user.name });
    const c = setSessionCookie(token);

    const response = NextResponse.redirect(`${appUrl}${redirectTo}`);
    response.cookies.set(c.name, c.value, c);
    // Clear CSRF state cookie
    response.cookies.set("google_oauth_state", "", { maxAge: 0, path: "/" });

    return response;
  } catch (err) {
    console.error("[google/callback]", err);
    return NextResponse.redirect(`${appUrl}/login?error=server`);
  }
}
