import { NextRequest, NextResponse } from "next/server";
import { createSessionValue, SESSION_COOKIE, verifyPassword, isPasswordSet, setPassword } from "@/lib/auth";
import { checkRateLimit, getRateLimitKey, resetRateLimit } from "@/lib/rate-limit";
import { ensureSchema } from "@/lib/db";
import { isDemoMode } from "@/lib/demo";
import { consumeResetCode } from "@/lib/reset-code";

export async function GET(request: NextRequest) {
  // Avoid leaking "is a password configured?" state to unauthenticated
  // clients without any throttling. Reuse the login rate-limit bucket.
  if (!isDemoMode()) {
    const rlKey = getRateLimitKey(request);
    if (!(await checkRateLimit(rlKey))) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }
  }

  await ensureSchema();
  const passwordSet = await isPasswordSet();
  return NextResponse.json({ passwordSet });
}

export async function POST(request: NextRequest) {
  const demo = isDemoMode();
  const rlKey = getRateLimitKey(request);

  if (!demo) {
    if (!(await checkRateLimit(rlKey))) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }
  }

  let body: { password?: string; new_password?: string; reset_code?: string; passwordless?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  await ensureSchema();

  // Demo mode: skip password verification
  if (!demo) {
    const passwordConfigured = await isPasswordSet();

    // Passwordless login: allow login without password if no password is set
    // or if the user explicitly requests passwordless login
    if (body.passwordless === true || (!passwordConfigured && !body.password && !body.reset_code)) {
      // Passwordless login allowed - no password verification needed
      // This enables flexible authentication as requested
    } else if (body.reset_code !== undefined) {
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
    } else if (!body.password && !body.passwordless) {
      return NextResponse.json(
        { error: "رمز عبور الزامی است یا گزینه ورود بدون رمز را فعال کنید" },
        { status: 401 },
      );
    }
  }

  const token = demo ? `demo.${crypto.randomUUID()}` : await createSessionValue();

  if (!demo) {
    await resetRateLimit(rlKey);
  }

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
