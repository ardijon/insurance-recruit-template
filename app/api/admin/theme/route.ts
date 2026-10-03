import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { revalidateHome } from "@/lib/revalidate";
import { selectOne, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";

export async function GET(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  await ensureSchema();
  const row = await selectOne(
    "SELECT site_theme FROM manager_profile WHERE id = 1"
  ) as { site_theme: string } | undefined;
  return NextResponse.json({ theme: row?.site_theme ?? "warm" });
}

export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let body: { theme?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.theme !== "warm" && body.theme !== "dark") {
    return NextResponse.json({ error: "theme must be 'warm' or 'dark'" }, { status: 422 });
  }

  await ensureSchema();
  const result = await executeUpdate(
    "UPDATE manager_profile SET site_theme = ?, updated_at = datetime('now') WHERE id = 1",
    [body.theme]
  );
  if (result.rowsAffected === 0) {
    await executeInsert(
      "INSERT INTO manager_profile (id, site_theme) VALUES (1, ?)",
      [body.theme]
    );
  }

  revalidateHome();
  return NextResponse.json({ success: true, theme: body.theme });
}
