import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import { join, basename } from "path";
import { getRelativeUploadPath, validateImageAndGetFilename } from "@/lib/image-storage";

// These routes use the Node.js filesystem APIs and must run on the Node runtime.
export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;
const UPLOAD_DIR = join(process.cwd(), "public", "uploads");

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("photo") as File | null;
    if (!file) {
      return NextResponse.json({ error: "no file uploaded" }, { status: 422 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "فرمت فایل مجاز نیست (jpg, png, gif, webp)" }, { status: 422 });
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" }, { status: 422 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filename = validateImageAndGetFilename(buffer, file.type);
    if (!filename) {
      return NextResponse.json({ error: "فایل معتبر نیست (فقط عکس مجاز است)" }, { status: 422 });
    }

    await mkdir(UPLOAD_DIR, { recursive: true });
    await ensureSchema();

    const photoUrl = getRelativeUploadPath(filename);

    // Capture the previous photo so we can delete its file after replacing it
    // (prevents orphaned uploads from filling the disk over time).
    const oldRow = await selectOne(
      "SELECT photo_url FROM manager_profile WHERE id = 1"
    ) as { photo_url?: string } | undefined;
    const oldUrl = oldRow?.photo_url;

    await writeFile(join(UPLOAD_DIR, filename), buffer);

    const updateResult = await executeUpdate(
      "UPDATE manager_profile SET photo_url = ?, updated_at = datetime('now') WHERE id = 1",
      [photoUrl]
    );

    // If the profile row doesn't exist, roll back the orphaned file write.
    if (updateResult.rowsAffected === 0) {
      try {
        await unlink(join(UPLOAD_DIR, filename));
      } catch { /* ignore */ }
      return NextResponse.json({ error: "profile not found" }, { status: 404 });
    }

    if (oldUrl && oldUrl !== photoUrl && !oldUrl.startsWith("data:")) {
      try {
        const target = join(UPLOAD_DIR, basename(oldUrl));
        if (target.startsWith(UPLOAD_DIR)) await unlink(target);
      } catch { /* file may not exist — ignore */ }
    }

    revalidatePath("/");
    return NextResponse.json({ photo_url: photoUrl });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
