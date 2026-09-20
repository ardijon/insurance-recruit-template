import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { revalidatePath } from "next/cache";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";
import { saveUpload } from "@/lib/upload-store";
import { validateImageAndGetFilename } from "@/lib/image-storage";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
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

    await ensureSchema();

    // saveUpload returns /api/uploads/<key> — stored directly in photo_url
    const photoUrl = await saveUpload(buffer, file.type);

    const updateResult = await executeUpdate(
      "UPDATE manager_profile SET photo_url = ?, updated_at = datetime('now') WHERE id = 1",
      [photoUrl]
    );

    if (updateResult.rowsAffected === 0) {
      return NextResponse.json({ error: "profile not found" }, { status: 404 });
    }

    revalidatePath("/");
    return NextResponse.json({ photo_url: photoUrl });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
