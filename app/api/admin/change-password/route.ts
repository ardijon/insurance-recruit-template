import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";
import { isDemoMode } from "@/lib/demo";
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "تغییر رمز در حالت دمو مجاز نیست" },
      { status: 403 }
    );
  }

  // Extra throttle on top of the session check: brute-forcing the current
  // password through this endpoint must be as expensive as the login page.
  if (!(await checkRateLimit(getRateLimitKey(request)))) {
    return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  }

  let body: { current_password?: string; new_password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { current_password, new_password } = body;

  if (!current_password || !new_password) {
    return NextResponse.json(
      { error: "رمز فعلی و رمز جدید الزامی است" },
      { status: 422 }
    );
  }

  if (new_password.length < 6) {
    return NextResponse.json(
      { error: "رمز جدید باید حداقل ۶ کاراکتر باشد" },
      { status: 422 }
    );
  }

  await ensureSchema();

  // Verify current password
  if (!(await verifyPassword(current_password))) {
    return NextResponse.json(
      { error: "رمز فعلی اشتباه است" },
      { status: 401 }
    );
  }

  // Hash and save new password
  const hash = await hashPassword(new_password);

  const existing = await selectOne(
    "SELECT key FROM settings WHERE key = 'admin_password_hash'"
  );

  if (existing) {
    await executeUpdate(
      "UPDATE settings SET value = ?, updated_at = datetime('now') WHERE key = 'admin_password_hash'",
      [hash]
    );
  } else {
    await executeUpdate(
      "INSERT INTO settings (key, value) VALUES ('admin_password_hash', ?)",
      [hash]
    );
  }

  return NextResponse.json({ success: true });
}
