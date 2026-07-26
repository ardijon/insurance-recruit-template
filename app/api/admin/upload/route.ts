import { NextRequest, NextResponse } from "next/server";
import { executeUpdate, ensureSchema } from "@/lib/db";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024;

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
    const base64 = Buffer.from(bytes).toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    await ensureSchema();
    await executeUpdate(
      "UPDATE manager_profile SET photo_url = ?, updated_at = datetime('now') WHERE id = 1",
      [dataUrl]
    );

    return NextResponse.json({ photo_url: dataUrl });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
