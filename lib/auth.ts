import bcrypt from "bcryptjs";
import { selectOne } from "@/lib/db";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

// Per-process fallback secret used only when neither SESSION_SECRET nor
// ADMIN_PASSWORD is configured (e.g. a deployment that relies solely on the
// DB-stored password hash). Sessions signed with this key are invalidated on
// server restart — acceptable for that mode, and far better than a 500/401 loop.
let ephemeralSecret: string | null = null;
function getEphemeralSecret(): string {
  if (ephemeralSecret === null) {
    const arr = new Uint8Array(32);
    crypto.getRandomValues(arr);
    ephemeralSecret = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return ephemeralSecret;
}

function getSigningKey(): Promise<CryptoKey> {
  let secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    console.warn(
      "[auth] SESSION_SECRET and ADMIN_PASSWORD are both unset — using an ephemeral, " +
      "restart-invalidated session key. Set SESSION_SECRET in production."
    );
    secret = getEphemeralSecret();
  }
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBuf(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
}

export async function createSessionValue(): Promise<string> {
  const key = await getSigningKey();
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS;
  const payload = `${crypto.randomUUID()}:${expiresAt}`;
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return `${payload}.${bufToHex(sig)}`;
}

export async function verifySessionValue(token: string): Promise<boolean> {
  if (!token) return false;
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const payload = token.slice(0, dot);
  const sigHex = token.slice(dot + 1);
  const sep = payload.indexOf(":");
  if (sep === -1) return false;
  const expiresAt = Number(payload.slice(sep + 1));
  if (Date.now() > expiresAt) return false;
  let key: CryptoKey;
  try {
    key = await getSigningKey();
  } catch {
    return false;
  }
  const expected = new Uint8Array(
    await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(payload),
    ),
  );
  const actual = hexToBuf(sigHex);
  if (expected.length !== actual.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected[i] ^ actual[i];
  return diff === 0;
}

export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const rawA = enc.encode(a);
  const rawB = enc.encode(b);
  const maxLen = Math.max(rawA.byteLength, rawB.byteLength);
  const paddedA = new Uint8Array(maxLen);
  const paddedB = new Uint8Array(maxLen);
  paddedA.set(rawA);
  paddedB.set(rawB);
  const key = await getSigningKey();
  const sigA = new Uint8Array(await crypto.subtle.sign("HMAC", key, paddedA));
  const sigB = new Uint8Array(await crypto.subtle.sign("HMAC", key, paddedB));
  let result = 0;
  for (let i = 0; i < sigA.length; i++) {
    result |= sigA[i] ^ sigB[i];
  }
  return result === 0;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(input: string): Promise<boolean> {
  const envPassword = process.env.ADMIN_PASSWORD;
  const row = await selectOne(
    "SELECT value FROM settings WHERE key = 'admin_password_hash'"
  ) as { value: string } | undefined;

  // If a password hash is stored (normal case), verify against it.
  if (row?.value) {
    if (await bcrypt.compare(input, row.value)) return true;
  }

  // Recovery password (ADMIN_PASSWORD env var) always works as a backup — even
  // after a hash has been set — so the manager can never be fully locked out.
  if (envPassword) {
    return timingSafeEqual(input, envPassword);
  }

  return false;
}

// True when a primary password hash has been persisted (set on first login or
// via the recovery flow). The ADMIN_PASSWORD env var is a recovery/reset key,
// not the primary password, so it must NOT count as "already set" here —
// otherwise the first-login "set your password" screen would never show.
export async function isPasswordSet(): Promise<boolean> {
  const row = await selectOne(
    "SELECT value FROM settings WHERE key = 'admin_password_hash'"
  ) as { value: string } | undefined;
  return !!row?.value;
}

export async function setPassword(password: string): Promise<void> {
  const hash = await hashPassword(password);
  // Upsert into settings table.
  await (await import("@/lib/db")).execute(
    `INSERT INTO settings (key, value, updated_at) VALUES ('admin_password_hash', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [hash]
  );
}
