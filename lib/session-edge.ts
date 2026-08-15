// Session verification for proxy (Next.js 16+).
//
// The proxy runs on Node.js runtime by default. This module uses the Web Crypto
// API which is available in both Edge and Node.js runtimes.
// Importing lib/auth (which pulls in lib/db) is avoided here for compatibility.
//
// The signing key MUST match lib/auth.ts: SESSION_SECRET || ADMIN_PASSWORD ||
// ephemeral fallback. The ephemeral fallback differs per process, so sessions
// signed with it are invalid across processes — acceptable, and documented in
// lib/auth.ts. In production you should always set SESSION_SECRET.

export const SESSION_COOKIE = "admin_session";

function getSigningKeyMaterial(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function hexToBuf(hex: string): Uint8Array {
  const clean = hex.length % 2 === 0 ? hex : "0" + hex;
  return new Uint8Array(clean.match(/.{2}/g)?.map((h) => parseInt(h, 16)) ?? []);
}

export async function verifySessionValue(token: string): Promise<boolean> {
  if (!token || !getSigningKeyMaterial()) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  const sep = payload.indexOf(":");
  if (sep === -1) return false;
  const expiresAt = Number(payload.slice(sep + 1));
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSigningKeyMaterial()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const expected = new Uint8Array(
    await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)),
  );
  let actual: Uint8Array;
  try {
    actual = hexToBuf(sigHex);
  } catch {
    return false;
  }
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i];
  return diff === 0;
}
