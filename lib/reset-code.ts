import { execute, selectOne } from "@/lib/db";
import { randomInt, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const RESET_CODE_TTL_MS = 15 * 60 * 1000; // 15 minutes
const scryptAsync = promisify(scrypt);

interface ResetCodeRecord {
  code: string;
  expiresAt: number;
}

// Persists a single active password-reset code (keyed in settings). Only one
// outstanding code is allowed at a time — requesting a new one invalidates old.
// The code is stored HASHED (scrypt) so the plaintext never rests in the DB;
// we compare with a timing-safe check on consume.
export async function storeResetCode(code: string): Promise<void> {
  const expiresAt = Date.now() + RESET_CODE_TTL_MS;
  const salt = randomInt(0, 1 << 30).toString(36);
  const hash = (await scryptAsync(code, salt, 32)) as Buffer;
  const stored = `${salt}:${hash.toString("hex")}:${expiresAt}`;
  await execute(
    `INSERT INTO settings (key, value, updated_at) VALUES ('password_reset_code', ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [stored]
  );
}

export async function consumeResetCode(input: string): Promise<boolean> {
  const row = await selectOne(
    "SELECT value FROM settings WHERE key = 'password_reset_code'"
  ) as { value: string } | undefined;

  if (!row?.value) return false;

  const parts = row.value.split(":");
  if (parts.length !== 3) {
    await clearResetCode();
    return false;
  }
  const [salt, hashHex, expiresAtRaw] = parts;
  const expiresAt = Number(expiresAtRaw);

  if (Date.now() > expiresAt) {
    await clearResetCode();
    return false;
  }

  const expected = Buffer.from(hashHex, "hex");
  let actual: Buffer;
  try {
    actual = (await scryptAsync(input, salt, 32)) as Buffer;
  } catch {
    return false;
  }
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return false;
  }

  // Single-use: clear immediately after a successful match.
  await clearResetCode();
  return true;
}

export async function clearResetCode(): Promise<void> {
  await execute("DELETE FROM settings WHERE key = 'password_reset_code'");
}

export function generateResetCode(): string {
  // Cryptographically secure 6-digit numeric code (range 100000..999999).
  return String(randomInt(100000, 1000000));
}

export type { ResetCodeRecord };
