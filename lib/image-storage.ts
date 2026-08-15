import { randomBytes } from "crypto";
import { basename } from "path";

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/gif": ".gif",
  "image/webp": ".webp",
};

// Magic-byte signatures — we validate the ACTUAL file content, not the
// client-claimed MIME type, so a fake ".webp" header can't smuggle in
// an SVG/PHP/etc. file.
const MAGIC_SIGNATURES: { ext: string; match: (b: Buffer) => boolean }[] = [
  { ext: ".jpg", match: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  {
    ext: ".png",
    match: (b) =>
      b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
      b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
  },
  { ext: ".gif", match: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 }, // "GIF"
  // WebP: RIFF container whose 4-byte form-type is "WEBP".
  {
    ext: ".webp",
    match: (b) =>
      b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && // "RIFF"
      b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50, // "WEBP"
  },
];

export function isBase64DataUrl(url: string): boolean {
  return url.startsWith("data:");
}

export function getRelativeUploadPath(filename: string): string {
  return `/uploads/${basename(filename)}`;
}

// Returns the safe on-disk filename, or null if the buffer is not a real
// image of an allowed type. Strips any path components from the caller.
export function validateImageAndGetFilename(buffer: Buffer, claimedMime: string): string | null {
  if (buffer.length < 12) return null;
  const matched = MAGIC_SIGNATURES.find((sig) => sig.match(buffer));
  if (!matched) return null;
  // Reject SVG / XML / HTML content anywhere near the start — SVG can carry
  // script and we only allow raster images. Check the first 4KB, not just 512B.
  const head = buffer.subarray(0, 4096).toString("latin1").toLowerCase();
  if (
    head.includes("<svg") ||
    head.trimStart().startsWith("<?xml") ||
    head.trimStart().startsWith("<html") ||
    head.includes("<script")
  ) {
    return null;
  }
  const ext = MIME_TO_EXT[claimedMime] || matched.ext;
  const id = randomBytes(16).toString("hex");
  return `${id}${ext}`;
}
