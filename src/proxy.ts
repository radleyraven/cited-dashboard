import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes — no auth required
const PUBLIC_ROUTES = [
  "/login",
  "/auth",
  "/score",
  "/how-it-works",
  "/30-days",
  "/intake",
  "/api/intake",
  "/copy-kit",
  "/guides",
  "/privacy",
  "/terms",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Allow static files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/client/")
  ) {
    return NextResponse.next();
  }

  // Check for Supabase auth cookie — fast, no API call, no race condition
  const hasSession =
    request.cookies.has(`sb-oxipzgkcmnsulgywsjbq-auth-token`) ||
    request.cookies
      .getAll()
      .some(
        (c) =>
          c.name.startsWith("sb-") &&
          (c.name.includes("auth-token") || c.name.includes("access-token"))
      );

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|client/).*)"],
};
