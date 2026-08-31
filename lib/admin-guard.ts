import type { NextRequest } from "next/server";
import { verifySessionValue, SESSION_COOKIE } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";

// Server-side session check for admin API endpoints (same rules as
// /api/admin/verify). Every admin route must use this.
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return false;
  if (isDemoMode() && token.startsWith("demo.")) return true;
  try {
    if (!(await verifySessionValue(token))) return false;
  } catch {
    return false;
  }

  // Double-submit CSRF check on mutating requests. adminFetch always sends
  // the x-csrf-token header; SameSite=strict on the session cookie remains
  // the primary defense — this is defense in depth.
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const cookieToken = request.cookies.get("csrf_token")?.value ?? "";
    const headerToken = request.headers.get("x-csrf-token") ?? "";
    if (!cookieToken || !headerToken || cookieToken !== headerToken) return false;
  }
  return true;
}
