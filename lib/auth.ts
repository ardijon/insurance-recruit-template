import bcrypt from "bcryptjs";
import { selectOne } from "@/lib/db";

export const SESSION_COOKIE = "admin_session";
const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const BCRYPT_ROUNDS = 10;

function getSigningKey(): Promise<CryptoKey> {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("SESSION_SECRET or ADMIN_PASSWORD environment variable is not set");
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
  if (!process.env.ADMIN_PASSWORD || !token) return false;
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
  if (!envPassword) {
    return false;
  }

  const row = await selectOne(
    "SELECT value FROM settings WHERE key = 'admin_password_hash'"
  ) as { value: string } | undefined;

  // Always run both paths to prevent timing side-channel
  const envMatch = timingSafeEqual(input, envPassword);
  const hashMatch = row?.value ? bcrypt.compare(input, row.value) : Promise.resolve(false);

  const [envResult, hashResult] = await Promise.all([envMatch, hashMatch]);
  return envResult || hashResult;
}
