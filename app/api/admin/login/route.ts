import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, verifyPassword, isPasswordSet, setPassword } from "@/lib/auth";
import { checkRateLimit, getRateLimitKey, resetRateLimit } from "@/lib/rate-limit";
import { ensureSchema } from "@/lib/db";
import { isDemoMode } from "@/lib/demo";
import { consumeResetCode } from "@/lib/reset-code";

export async function GET(request: NextRequest) {
  // Avoid leaking "is a password configured?" state to unauthenticated
  // clients without any throttling. Reuse the login rate-limit bucket.

  // Demo deployment with open admin (DEMO_OPEN_ADMIN=true): answer without
  // touching the DB (none exists on the Workers demo) and let the login page
  // show its one-click demo entry. Never true in buyer deployments.
  if (isDemoMode() && process.env.DEMO_OPEN_ADMIN === "true") {
    return NextResponse.json({ passwordSet: false, demoOpen: true });
  }

  if (!isDemoMode()) {
    const rlKey = getRateLimitKey(request);
    if (!(await checkRateLimit(rlKey))) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }
  }

  await ensureSchema();
  const passwordSet = await isPasswordSet();
  return NextResponse.json({ passwordSet, demoOpen: false });
}

export async function POST(request: NextRequest) {
  const demo = isDemoMode();
  const rlKey = getRateLimitKey(request);

  if (!demo) {
    if (!(await checkRateLimit(rlKey))) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }
  }

  let body: { password?: string; new_password?: string; reset_code?: string; demo?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Demo mode: skip password verification (no real DB on the Workers demo)
  if (demo) {
    const token = `demo.${crypto.randomUUID()}`;
    const response = NextResponse.json({ success: true, demo: true });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return response;
  }

  await ensureSchema();
  const passwordConfigured = await isPasswordSet();

  if (body.reset_code !== undefined) {
    // Forgot-password reset: must present a valid Telegram-sent reset code.
    const newPassword = body.new_password ?? "";
    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور جدید باید حداقل ۶ کاراکتر باشد" },
        { status: 422 },
      );
    }
    const ok = await consumeResetCode(body.reset_code);
    if (!ok) {
      return NextResponse.json(
        { error: "کد بازیابی نامعتبر یا منقضی شده است" },
        { status: 401 },
      );
    }
    await setPassword(newPassword);
  } else if (!passwordConfigured) {
    // First login: no password set yet → set it now.
    const newPassword = body.new_password ?? body.password ?? "";
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "رمز عبور باید حداقل ۶ کاراکتر باشد" },
        { status: 422 },
      );
    }
    await setPassword(newPassword);
  } else if (body.password && !(await verifyPassword(body.password))) {
    return NextResponse.json(
      { error: "رمز عبور اشتباه است" },
      { status: 401 },
    );
  } else if (!body.password) {
    return NextResponse.json(
      { error: "رمز عبور الزامی است" },
      { status: 401 },
    );
  }

  await resetRateLimit(rlKey);

  const token = await createSessionValue();
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
