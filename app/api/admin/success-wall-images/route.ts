import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-guard";
import { revalidateHome } from "@/lib/revalidate";
import { selectOne, executeUpdate, ensureSchema } from "@/lib/db";
import { validateAndStoreUpload } from "@/lib/upload-handler";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const entryId = formData.get("entry_id") as string | null;

    if (!file || !entryId) {
      return NextResponse.json({ error: "image and entry_id are required" }, { status: 422 });
    }
    const stored = await validateAndStoreUpload(file);
    if ("error" in stored) return NextResponse.json({ error: stored.error }, { status: stored.status });
    const imageUrl = stored.url;

    await ensureSchema();

    const result = await executeUpdate(
      `UPDATE success_wall_entries
       SET images_json = json_insert(COALESCE(images_json, '[]'), '$[#]', ?)
       WHERE id = ?`,
      [imageUrl, Number(entryId)]
    );

    if (result.rowsAffected === 0) {
      return NextResponse.json({ error: "entry not found" }, { status: 404 });
    }

    const row = await selectOne(
      "SELECT images_json FROM success_wall_entries WHERE id = ?",
      [Number(entryId)]
    ) as { images_json: string } | undefined;

    let images: string[] = [];
    if (row) {
      try {
        const parsed: unknown = JSON.parse(row.images_json);
        images = Array.isArray(parsed) ? (parsed as string[]) : [];
      } catch {
        images = [];
      }
    }

    revalidateHome();
    return NextResponse.json({ image_url: imageUrl, images });
  } catch {
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest(request))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  let entryId: string | null = null;
  let imageUrl: string | null = null;

  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    entryId = body.entry_id != null ? String(body.entry_id) : null;
    imageUrl = body.image_url ?? null;
  } else {
    const { searchParams } = new URL(request.url);
    entryId = searchParams.get("entry_id");
    imageUrl = searchParams.get("image_url");
  }

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

  const idx = images.indexOf(imageUrl);
  if (idx === -1) {
    return NextResponse.json({ error: "image not found" }, { status: 404 });
  }

  await executeUpdate(
    "UPDATE success_wall_entries SET images_json = json_remove(images_json, ?) WHERE id = ?",
    [`$[${idx}]`, Number(entryId)]
  );

  const filtered = images.filter((img) => img !== imageUrl);
  revalidateHome();
  return NextResponse.json({ images: filtered });
}
