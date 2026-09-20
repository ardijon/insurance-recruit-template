import { NextRequest, NextResponse } from "next/server";
import { verifySessionValue, SESSION_COOKIE, CSRF_COOKIE, CSRF_MAX_AGE, newCsrfToken } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  // Demo mode: accept any demo session token
  if (isDemoMode() && token?.startsWith("demo.")) {
    return NextResponse.json({ authenticated: true });
  }

  if (!token || !(await verifySessionValue(token))) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  // Self-heal: reissue the CSRF cookie when missing so mutating admin
  // requests keep passing the double-submit check after cookie wipes.
  const response = NextResponse.json({ authenticated: true });
  if (!request.cookies.get(CSRF_COOKIE)?.value) {
    response.cookies.set(CSRF_COOKIE, newCsrfToken(), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: CSRF_MAX_AGE,
    });
  }
  return response;
}
