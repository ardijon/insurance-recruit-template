import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { selectOne, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { saveUpload } from "@/lib/upload-store";
import { validateImageAndGetFilename } from "@/lib/image-storage";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

function validateImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) return "فرمت فایل مجاز نیست (jpg, png, gif, webp)";
  if (file.size > MAX_SIZE) return "حجم فایل نباید بیشتر از ۵ مگابایت باشد";
  return null;
}

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "image is required" }, { status: 422 });

    const err = validateImage(file);
    if (err) return NextResponse.json({ error: err }, { status: 422 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = validateImageAndGetFilename(buffer, file.type);
    if (!filename) return NextResponse.json({ error: "فایل معتبر نیست (فقط عکس مجاز است)" }, { status: 422 });

    // saveUpload returns /api/uploads/<key> — stored directly in JSON
    const imageUrl = await saveUpload(buffer, file.type);

    await ensureSchema();

    const upd = await executeUpdate(
      `UPDATE success_visual_story
       SET images_json = json_insert(images_json, '$[#]', ?),
           updated_at = datetime('now')
       WHERE id = 1`,
      [imageUrl]
    );
    if (upd.rowsAffected === 0) {
      await executeInsert(
        "INSERT INTO success_visual_story (id, images_json) VALUES (1, ?)",
        [JSON.stringify([imageUrl])]
      );
    }

    revalidatePath("/");
    return NextResponse.json({ image_url: imageUrl, images: [imageUrl] });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let imageUrl: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    imageUrl = body.image_url ?? null;
  } else {
    const { searchParams } = new URL(request.url);
    imageUrl = searchParams.get("image_url");
  }

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

  const idx = images.indexOf(imageUrl);
  if (idx !== -1) {
    await executeUpdate(
      "UPDATE success_visual_story SET images_json = json_remove(images_json, ?), updated_at = datetime('now') WHERE id = 1",
      [`$[${idx}]`]
    );
  }

  const filtered = images.filter((img) => img !== imageUrl);
  revalidatePath("/");
  return NextResponse.json({ images: filtered });
}
