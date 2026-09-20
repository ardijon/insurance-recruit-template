import { NextRequest, NextResponse } from "next/server";
import { getUpload } from "@/lib/upload-store";
import { getR2Bucket } from "@/lib/storage";

export const runtime = "nodejs";

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key } = await params;
  const objectKey = key.join("/");
  if (!objectKey || objectKey.includes("..")) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  // 1. Try D1 uploads table first
  const d1Upload = await getUpload(objectKey);
  if (d1Upload) {
    const buf = Buffer.from(d1Upload.data, "base64");
    return new NextResponse(buf, {
      headers: {
        "content-type": d1Upload.mime,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  }

  // 2. Fall back to R2 (for any legacy uploads)
  const bucket = await getR2Bucket();
  if (bucket) {
    const obj = await bucket.get(objectKey);
    if (obj) {
      const ext = objectKey.slice(objectKey.lastIndexOf(".")).toLowerCase();
      const contentType =
        obj.httpMetadata?.contentType ?? MIME_BY_EXT[ext] ?? "application/octet-stream";
      const buf = await obj.arrayBuffer();
      return new NextResponse(buf, {
        headers: {
          "content-type": contentType,
          "cache-control": "public, max-age=31536000, immutable",
        },
      });
    }
  }

  return NextResponse.json({ error: "not found" }, { status: 404 });
}
