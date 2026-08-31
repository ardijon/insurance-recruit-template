import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";

// لایه ۲ مرکز به‌روزرسانی — درخواست rebuild از پلتفرم هاست خریدار.
// UPDATE_DEPLOY_HOOK_URL = Deploy Hook (Vercel / Cloudflare Workers Builds /
// Railway webhook) که به ریپوی خصوصی خریدار متصل است.
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const hookUrl = (process.env.UPDATE_DEPLOY_HOOK_URL ?? "").trim();
  if (!hookUrl) {
    return NextResponse.json({ error: "متغیر UPDATE_DEPLOY_HOOK_URL تنظیم نشده است" }, { status: 400 });
  }

  try {
    const res = await fetch(hookUrl, {
      method: "POST",
      signal: AbortSignal.timeout(10000),
    });
    return NextResponse.json({ ok: res.ok, status: res.status });
  } catch {
    return NextResponse.json({ error: "خطا در تماس با سرویس هاست" }, { status: 502 });
  }
}
