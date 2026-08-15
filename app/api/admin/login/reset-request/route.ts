import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getRateLimitKey, resetRateLimit } from "@/lib/rate-limit";
import { ensureSchema } from "@/lib/db";
import { isDemoMode } from "@/lib/demo";
import { storeResetCode, generateResetCode } from "@/lib/reset-code";
import { sendTelegramText } from "@/lib/telegram";

export async function POST(request: NextRequest) {
  const demo = isDemoMode();
  const rlKey = getRateLimitKey(request);

  if (!demo) {
    if (!(await checkRateLimit(rlKey))) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }
    // Small extra throttle: reset requests are heavier (Telegram send).
    await new Promise((r) => setTimeout(r, 500));
  }

  await ensureSchema();

  const code = generateResetCode();

  if (!demo) {
    const sent = await sendTelegramText(
      `🔐 <b>بازیابی رمز عبور پنل مدیریت</b>\n\nکد تأیید شما: <b>${code}</b>\n\nاین کد تا ۱۵ دقیقه معتبر است و پس از یک بار استفاده منقضی میشود.`
    );
    await resetRateLimit(rlKey);

    if (!sent) {
      return NextResponse.json(
        { error: "ارسال پیام به تلگرام انجام نشد. اتصال ربات را بررسی کنید." },
        { status: 502 }
      );
    }
    // Only persist the code after we know it was successfully delivered.
    await storeResetCode(code);
  } else {
    // In demo mode there's no real Telegram — store and surface the code.
    await storeResetCode(code);
  }

  const body = demo ? { success: true, code } : { success: true };
  return NextResponse.json(body);
}
