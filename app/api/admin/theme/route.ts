import { NextRequest, NextResponse } from "next/server";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const row = await selectOne(
    "SELECT site_theme FROM manager_profile WHERE id = 1"
  ) as { site_theme: string } | undefined;
  return NextResponse.json({ theme: row?.site_theme ?? "warm" });
}

export async function PUT(request: NextRequest) {
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
  await executeUpdate(
    "UPDATE manager_profile SET site_theme = ?, updated_at = datetime('now') WHERE id = 1",
    [body.theme]
  );

  return NextResponse.json({ success: true, theme: body.theme });
}
