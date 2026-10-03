import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { revalidateHome } from "@/lib/revalidate";
import { executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { validateAndStoreUpload } from "@/lib/upload-handler";

export const runtime = "nodejs";

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

    const stored = await validateAndStoreUpload(file);
    if ("error" in stored) {
      return NextResponse.json({ error: stored.error }, { status: stored.status });
    }
    const photoUrl = stored.url;

    await ensureSchema();

    const updateResult = await executeUpdate(
      "UPDATE manager_profile SET photo_url = ?, updated_at = datetime('now') WHERE id = 1",
      [photoUrl]
    );

    if (updateResult.rowsAffected === 0) {
      await executeInsert(
        "INSERT INTO manager_profile (id, photo_url) VALUES (1, ?)",
        [photoUrl]
      );
    }

    revalidateHome();
    return NextResponse.json({ photo_url: photoUrl });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
