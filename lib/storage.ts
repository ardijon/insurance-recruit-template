// lib/storage.ts
//
// Upload storage abstraction: R2 on Workers, filesystem locally.
//
// Why: Workers has no writable filesystem. Upload routes detect the R2
// binding via getCloudflareContext(); when present they store files in R2
// and serve them through /api/uploads/[...key]. Locally they keep the old
// public/uploads behavior unchanged.

interface R2ObjectBody {
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2BucketLike {
  put(key: string, value: ArrayBuffer | Uint8Array, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<(R2ObjectBody & { httpMetadata?: { contentType?: string } }) | null>;
  delete(key: string): Promise<void>;
}

export async function getR2Bucket(): Promise<R2BucketLike | null> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = getCloudflareContext({ async: false });
    const bucket = (ctx.env as Record<string, unknown>).UPLOADS as R2BucketLike | undefined;
    return bucket ?? null;
  } catch {
    return null;
  }
}

export function isR2Url(url: string): boolean {
  return url.startsWith("/api/uploads/");
}

export function r2KeyFromUrl(url: string): string {
  return url.replace(/^\/api\/uploads\//, "");
}

export function r2UrlFromKey(key: string): string {
  return `/api/uploads/${key}`;
}
