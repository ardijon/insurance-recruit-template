// lib/upload-store.ts
//
// Image storage via Cloudflare KV — fast reads, no D1 blob overhead.
// saveUpload() returns /api/uploads/<key> URL stored in JSON columns.

import { randomBytes } from "crypto";

function generateKey(): string {
  return randomBytes(16).toString("hex");
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
  };
  return map[mime] ?? ".jpg";
}

async function getKV(): Promise<{ put: (key: string, val: string) => Promise<void>; get: (key: string) => Promise<string | null> } | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext({ async: false });
    return (ctx.env as Record<string, unknown>).UPLOADS as { put: (key: string, val: string) => Promise<void>; get: (key: string) => Promise<string | null> } | undefined ?? null;
  } catch {
    return null;
  }
}

/**
 * Store an image blob in KV. Returns /api/uploads/<key> URL path.
 */
export async function saveUpload(buffer: Buffer, mime: string): Promise<string> {
  const key = generateKey();
  const ext = mimeToExt(mime);
  const filename = `${key}${ext}`;
  const b64 = buffer.toString("base64");
  const payload = JSON.stringify({ d: b64, m: mime });

  const kv = await getKV();
  if (kv) {
    await kv.put(filename, payload);
  } else {
    // Local dev fallback: D1 uploads table
    const { executeInsert } = await import("@/lib/db");
    await executeInsert(
      "INSERT INTO uploads (key, data, mime, size) VALUES (?, ?, ?, ?)",
      [filename, b64, mime, buffer.length]
    );
  }

  return `/api/uploads/${filename}`;
}

/**
 * Retrieve an uploaded image by key (used by /api/uploads/[...key] route).
 */
export async function getUpload(key: string): Promise<{ data: string; mime: string } | null> {
  const kv = await getKV();
  if (kv) {
    const raw = await kv.get(key);
    if (!raw) return null;
    try {
      const { d, m } = JSON.parse(raw) as { d: string; m: string };
      return { data: d, mime: m };
    } catch {
      return null;
    }
  }

  // Local dev fallback: D1
  const { selectOne } = await import("@/lib/db");
  const row = await selectOne(
    "SELECT data, mime FROM uploads WHERE key = ?",
    [key]
  ) as { data?: string; mime?: string } | undefined;
  if (!row?.data || !row?.mime) return null;
  return { data: row.data, mime: row.mime };
}
