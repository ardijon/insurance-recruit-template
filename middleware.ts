// Protects admin routes — only the manager (who knows ADMIN_PASSWORD) may
// access /api/admin/* and /admin/*. Public routes (/api/applications,
// /api/referrals) remain open.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute =
    pathname.startsWith("/api/admin/") || pathname.startsWith("/admin");

  if (!isAdminRoute) return NextResponse.next();

  const isPublicAdminPage =
    pathname === "/admin/login" || pathname === "/api/admin/login";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!isPublicAdminPage && (!token || !(await verifySessionValue(token)))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*"],
};
