import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/login") || pathname.startsWith("/auth") || pathname.startsWith("/api/intake") || pathname.startsWith("/score")) {
    return NextResponse.next();
  }

  // Check for supabase session cookie (Cited project)
  const hasSession =
    request.cookies.has("sb-oxipzgkcmnsulgywsjbq-auth-token") ||
    request.cookies
      .getAll()
      .some((c) => c.name.startsWith("sb-") && c.name.includes("auth"));

  if (!hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|client/).*)"],
};
