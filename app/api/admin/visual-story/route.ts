import { NextRequest, NextResponse } from "next/server";
import { selectOne, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";

export async function GET() {
  await ensureSchema();
  const row = await selectOne(
    "SELECT images_json FROM success_visual_story WHERE id = 1"
  ) as { images_json: string } | undefined;
  return NextResponse.json({ images_json: row?.images_json ?? "[]" });
}

export async function PUT(request: NextRequest) {
  let body: { images_json?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (body.images_json === undefined) {
    return NextResponse.json({ error: "images_json is required" }, { status: 422 });
  }

  await ensureSchema();
  const exists = await selectOne("SELECT id FROM success_visual_story WHERE id = 1");
  if (exists) {
    await executeUpdate(
      "UPDATE success_visual_story SET images_json = ?, updated_at = datetime('now') WHERE id = 1",
      [body.images_json]
    );
  } else {
    await executeInsert(
      "INSERT INTO success_visual_story (id, images_json) VALUES (1, ?)",
      [body.images_json]
    );
  }

  return NextResponse.json({ success: true });
}
