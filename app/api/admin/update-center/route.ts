import { NextRequest, NextResponse } from "next/server";
import { fetchRemoteReleases } from "@/lib/update-center";
import { isAdminRequest } from "@/lib/admin-guard";

// لایه ۱ مرکز به‌روزرسانی — فقط مدیر سایت (خریدار) آن را می‌بیند.
// ?refresh=1 بدون کش بررسی می‌کند (دکمه «بررسی مجدد»).
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const refresh = new URL(request.url).searchParams.get("refresh") === "1";
  const info = await fetchRemoteReleases(refresh);
  return NextResponse.json({
    ...info,
    deployHookConfigured: !!(process.env.UPDATE_DEPLOY_HOOK_URL ?? "").trim(),
  });
}
