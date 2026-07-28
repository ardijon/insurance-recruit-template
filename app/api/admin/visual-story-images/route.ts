import { NextRequest, NextResponse } from "next/server";
import { selectOne, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "فرمت فایل مجاز نیست (jpg, png, gif, webp)";
  if (file.size > MAX_SIZE) return "حجم فایل نباید بیشتر از ۵ مگابایت باشد";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "image is required" }, { status: 422 });
    }

    const err = validateImage(file);
    if (err) return NextResponse.json({ error: err }, { status: 422 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    await ensureSchema();
    const row = await selectOne(
      "SELECT images_json FROM success_visual_story WHERE id = 1"
    ) as { images_json: string } | undefined;
    let images: string[];
    try {
      images = row ? JSON.parse(row.images_json) : [];
    } catch {
      images = [];
    }
    images.push(dataUrl);

    const exists = await selectOne("SELECT id FROM success_visual_story WHERE id = 1");
    if (exists) {
      await executeUpdate(
        "UPDATE success_visual_story SET images_json = ?, updated_at = datetime('now') WHERE id = 1",
        [JSON.stringify(images)]
      );
    } else {
      await executeInsert(
        "INSERT INTO success_visual_story (id, images_json) VALUES (1, ?)",
        [JSON.stringify(images)]
      );
    }

    return NextResponse.json({ image_url: dataUrl, images });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("image_url");
  if (!imageUrl) {
    return NextResponse.json({ error: "image_url is required" }, { status: 422 });
  }

  await ensureSchema();
  const row = await selectOne(
    "SELECT images_json FROM success_visual_story WHERE id = 1"
  ) as { images_json: string } | undefined;
  if (!row) return NextResponse.json({ images: [] });

  let images: string[];
  try {
    images = JSON.parse(row.images_json);
  } catch {
    return NextResponse.json({ images: [] });
  }
  const filtered = images.filter((img) => img !== imageUrl);
  await executeUpdate(
    "UPDATE success_visual_story SET images_json = ?, updated_at = datetime('now') WHERE id = 1",
    [JSON.stringify(filtered)]
  );

  return NextResponse.json({ images: filtered });
}
