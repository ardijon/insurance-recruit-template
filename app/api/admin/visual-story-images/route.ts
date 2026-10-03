import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { revalidateHome } from "@/lib/revalidate";
import { selectOne, executeInsert, executeUpdate, ensureSchema } from "@/lib/db";
import { validateAndStoreUpload } from "@/lib/upload-handler";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    if (!file) return NextResponse.json({ error: "image is required" }, { status: 422 });

    const stored = await validateAndStoreUpload(file);
    if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: stored.status });
    const imageUrl = stored.url;

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

    revalidateHome();
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
  revalidateHome();
  return NextResponse.json({ images: filtered });
}
