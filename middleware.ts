// Protects admin routes — only the manager (who knows ADMIN_PASSWORD) may
// access /api/admin/* and /admin/*. Public routes (/api/applications,
// /api/referrals) remain open.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/auth";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function generateToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

async function generateCsrfToken(sessionToken: string): Promise<string> {
  const sessionSecret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const token = generateToken();
  const payload = `${token}:${sessionToken}`;
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  const sigHex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${token}.${sigHex}`;
}

async function verifyCsrfToken(token: string, sessionToken: string): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [csrfToken, sigHex] = parts;
  const sessionSecret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sessionSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const payload = `${csrfToken}:${sessionToken}`;
  const sigBuf = new Uint8Array(sigHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  return crypto.subtle.verify("HMAC", key, sigBuf, new TextEncoder().encode(payload));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminApiRoute = pathname.startsWith("/api/admin/");
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/api/");

  if (!isAdminApiRoute && !isAdminPage) return NextResponse.next();

  const isPublicAdminPage =
    pathname === "/admin/login" || pathname === "/api/admin/login";

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!isPublicAdminPage && (!token || !(await verifySessionValue(token)))) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // CSRF: ensure a CSRF cookie exists for admin pages
  if (isAdminPage) {
    const existingCsrf = request.cookies.get(CSRF_COOKIE)?.value;
    if (!existingCsrf) {
      const response = NextResponse.next();
      const sessionToken = request.cookies.get(SESSION_COOKIE)?.value || "";
      const csrfToken = sessionToken
        ? await generateCsrfToken(sessionToken)
        : generateToken();
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }
    return NextResponse.next();
  }

  // CSRF: verify token on state-changing admin API routes (except login)
  if (isAdminApiRoute && STATE_CHANGING_METHODS.has(request.method) && !isPublicAdminPage) {
    const cookieToken = request.cookies.get(CSRF_COOKIE)?.value;
    const headerToken = request.headers.get(CSRF_HEADER);
    const sessionToken = request.cookies.get(SESSION_COOKIE)?.value;
    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      return NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 });
    }
    // Verify CSRF is bound to session
    if (sessionToken && !(await verifyCsrfToken(cookieToken, sessionToken))) {
      return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*"],
};
