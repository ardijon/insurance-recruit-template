import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, hashPassword } from "@/lib/auth";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";

export async function POST(request: NextRequest) {
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
