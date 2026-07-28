import { NextRequest, NextResponse } from "next/server";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";

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
    const entryId = formData.get("entry_id") as string | null;

    if (!file || !entryId) {
      return NextResponse.json({ error: "image and entry_id are required" }, { status: 422 });
    }
    const err = validateImage(file);
    if (err) return NextResponse.json({ error: err }, { status: 422 });

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    await ensureSchema();
    const row = await selectOne(
      "SELECT images_json FROM success_wall_entries WHERE id = ?",
      [Number(entryId)]
    ) as { images_json: string } | undefined;

    let images: string[];
    try {
      images = row ? JSON.parse(row.images_json) : [];
    } catch {
      images = [];
    }
    images.push(dataUrl);

    await executeUpdate(
      "UPDATE success_wall_entries SET images_json = ? WHERE id = ?",
      [JSON.stringify(images), Number(entryId)]
    );

    return NextResponse.json({ image_url: dataUrl, images });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entryId = searchParams.get("entry_id");
  const imageUrl = searchParams.get("image_url");

  if (!entryId || !imageUrl) {
    return NextResponse.json({ error: "entry_id and image_url are required" }, { status: 422 });
  }

  await ensureSchema();
  const row = await selectOne(
    "SELECT images_json FROM success_wall_entries WHERE id = ?",
    [Number(entryId)]
  ) as { images_json: string } | undefined;

  if (!row) {
    return NextResponse.json({ error: "entry not found" }, { status: 404 });
  }

  let images: string[];
  try {
    images = JSON.parse(row.images_json);
  } catch {
    return NextResponse.json({ error: "invalid images data" }, { status: 500 });
  }
  const filtered = images.filter((img) => img !== imageUrl);

  await executeUpdate(
    "UPDATE success_wall_entries SET images_json = ? WHERE id = ?",
    [JSON.stringify(filtered), Number(entryId)]
  );

  return NextResponse.json({ images: filtered });
}
