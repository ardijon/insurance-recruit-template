import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, timingSafeEqual } from "@/lib/auth";
import { checkRateLimit, getRateLimitKey, resetRateLimit } from "@/lib/rate-limit";

const RATE_LIMIT_COOKIE = "rl_attempt";

export async function POST(request: NextRequest) {
  const rlFingerprint = request.cookies.get(RATE_LIMIT_COOKIE)?.value;
  const rlKey = getRateLimitKey(request.headers, rlFingerprint);
  if (!checkRateLimit(rlKey)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured" },
      { status: 500 },
    );
  }

  if (!(await timingSafeEqual(body.password ?? "", adminPassword))) {
    return NextResponse.json(
      { error: "رمز عبور اشتباه است" },
      { status: 401 },
    );
  }

  const token = await createSessionValue();

  resetRateLimit(rlKey);

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  if (!rlFingerprint) {
    response.cookies.set(RATE_LIMIT_COOKIE, crypto.randomUUID(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  }

  return response;
}
