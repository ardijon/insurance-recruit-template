// Protects admin routes — only the manager (who knows ADMIN_PASSWORD) may
// access /api/admin/* and /admin/*. Public routes (/api/applications,
// /api/referrals) remain open.
// In DEMO_MODE, auth is bypassed and write operations return mock responses.
//
// NOTE: proxy runs on Node.js runtime by default (Next.js 16+).
// Session verification uses lib/session-edge.ts with Web Crypto API
// which works in both Edge and Node.js runtimes.

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "@/lib/session-edge";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

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
  const sigBuf = new Uint8Array((sigHex.match(/.{2}/g) ?? []).map((h) => parseInt(h, 16)));
  return crypto.subtle.verify("HMAC", key, sigBuf, new TextEncoder().encode(payload));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const demo = isDemoMode();

  // Demo mode allowed in production for demo deployments.

  const isAdminApiRoute = pathname.startsWith("/api/admin/");
  const isAdminPage = pathname.startsWith("/admin") && !pathname.startsWith("/api/");

  if (!isAdminApiRoute && !isAdminPage) return NextResponse.next();

  const isPublicAdminPage =
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname.startsWith("/api/admin/login/");

  // --- DEMO MODE: bypass auth, set session cookie automatically ---
  if (demo) {
    // For login endpoint in demo mode, set a session cookie and return success
    if (isPublicAdminPage && pathname === "/api/admin/login" && request.method === "POST") {
      const response = NextResponse.json({ success: true });
      const demoToken = generateToken();
      response.cookies.set(SESSION_COOKIE, `demo.${demoToken}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

    // For admin pages and API, allow access without auth
    if (isAdminPage) {
      // Set CSRF cookie for pages
      const response = NextResponse.next();
      const csrfToken = generateToken();
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24,
      });
      return response;
    }

    // For state-changing API routes in demo mode, return mock success
    if (isAdminApiRoute && STATE_CHANGING_METHODS.has(request.method) && !isPublicAdminPage) {
      return NextResponse.json({
        success: true,
        message: "در حالت دمو، تغییرات ذخیره نمیشوند",
      });
    }

    return NextResponse.next();
  }

  // --- NORMAL MODE: full auth + CSRF ---
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
    if (!cookieToken || !headerToken || cookieToken.length !== headerToken.length) {
      return NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 });
    }
    // Timing-safe comparison to prevent timing attacks
    let csrfDiff = 0;
    for (let i = 0; i < cookieToken.length; i++) {
      csrfDiff |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
    }
    if (csrfDiff !== 0) {
      return NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 });
    }
    // Verify CSRF is bound to session (only if token has signature, i.e. contains a dot)
    if (sessionToken && cookieToken.includes(".")) {
      if (!(await verifyCsrfToken(cookieToken, sessionToken))) {
        return NextResponse.json({ error: "CSRF token invalid" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/admin/:path*", "/admin/:path*"],
};
