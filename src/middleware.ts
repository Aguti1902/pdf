import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "es", "fr", "de", "it", "uk", "ru"] as const;
type Locale = (typeof LOCALES)[number];

function getLocaleFromPath(pathname: string): Locale | null {
  for (const locale of LOCALES) {
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return locale;
    }
  }
  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static files, API routes and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    /\.\w+$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  const locale = getLocaleFromPath(pathname);

  if (locale) {
    // Strip the locale segment and rewrite to the actual route
    const strippedPath = pathname.slice(locale.length + 1) || "/";
    const url = request.nextUrl.clone();
    url.pathname = strippedPath;

    const response = NextResponse.rewrite(url);
    // Set locale cookie so LanguageContext picks it up
    response.cookies.set("pdfcraft_locale", locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
