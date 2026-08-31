import { NextRequest, NextResponse } from "next/server";
import { selectAll, ensureSchema } from "@/lib/db";
import { isAdminRequest } from "@/lib/admin-guard";

// بازه‌های زمانی رزرو شده برای یک تاریخ مشخص — برای غیرفعال‌کردن گزینه‌های
// تکراری در انتخابگر ساعت. هر بازه فقط یک‌بار قابل رزرو است.
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date")?.trim() || "";
  const excludeIdRaw = searchParams.get("exclude_id");
  const excludeId = excludeIdRaw !== null && /^\d+$/.test(excludeIdRaw) ? Number(excludeIdRaw) : null;

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date is required (YYYY-MM-DD)" }, { status: 400 });
  }

  try {
    await ensureSchema();

    const args: (string | number)[] = [date];
    let sql =
      "SELECT appointment_time FROM applicants WHERE appointment_date = ? AND appointment_time IS NOT NULL AND appointment_time != ''";
    if (excludeId !== null) {
      sql += " AND id != ?";
      args.push(excludeId);
    }

    const rows = await selectAll(sql, args);
    const times = rows.map((r) => String(r.appointment_time));
    return NextResponse.json({ times });
  } catch {
    return NextResponse.json({ error: "خطا در خواندن بازه‌های رزرو شده" }, { status: 500 });
  }
}
