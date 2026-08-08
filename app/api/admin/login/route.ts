import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { checkRateLimit, getRateLimitKey, resetRateLimit } from "@/lib/rate-limit";
import { ensureSchema } from "@/lib/db";

export async function POST(request: NextRequest) {
  const rlKey = getRateLimitKey(request.headers);
  if (!checkRateLimit(rlKey)) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  await ensureSchema();

  if (!(await verifyPassword(body.password ?? ""))) {
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

  return response;
}
