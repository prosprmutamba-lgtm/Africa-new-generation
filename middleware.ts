import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";
import { COOKIE_NAME, sessionSecret, verifySession } from "@/lib/cms/session-token";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // URLs: /en/..., /fr/...
});

/**
 * - /admin/*  : first gate — no valid signed session cookie => redirect to the login page.
 *               (This is only a fast pre-check. The authoritative checks run on the
 *               server in app/admin/(panel)/layout.tsx and in every /api/admin route.)
 * - everything else: locale routing (next-intl), unchanged.
 */
export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (pathname === "/admin/login") return NextResponse.next();
    let signedIn = false;
    try {
      signedIn = (await verifySession(req.cookies.get(COOKIE_NAME)?.value, sessionSecret())) !== null;
    } catch {
      signedIn = false; // secret not configured: the login page explains it
    }
    if (!signedIn) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return intlMiddleware(req);
}

export const config = {
  // /admin is handled above; locale routing applies to all paths except
  // API routes, /admin, uploaded media, Next internals and static files.
  matcher: ["/admin/:path*", "/((?!api|admin|media|_next|_vercel|.*\\..*).*)"],
};
