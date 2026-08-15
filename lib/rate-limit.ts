import { selectOne, executeInsert, executeUpdate, execute, ensureSchema } from "@/lib/db";
import type { NextRequest } from "next/server";

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

let schemaEnsured = false;

async function ensureRateLimitSchema(): Promise<void> {
  if (schemaEnsured) return;
  schemaEnsured = true;
  try {
    await ensureSchema();
    await execute(
      `CREATE TABLE IF NOT EXISTS rate_limit (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        reset_at INTEGER NOT NULL DEFAULT 0
      )`
    );
  } catch {
    // Schema might already exist or DB not ready — fall back to in-memory
  }
}

const memoryFallback = new Map<string, { count: number; resetAt: number }>();

// Periodically purge expired rows so the table can't grow without bound
// (every unique IP that ever hit a rate-limited endpoint would otherwise
// leave a permanent row).
let lastCleanup = 0;
async function purgeExpired(): Promise<void> {
  const now = Date.now();
  if (now - lastCleanup < 60_000) return;
  lastCleanup = now;
  try {
    await execute("DELETE FROM rate_limit WHERE reset_at < ?", [now]);
  } catch {
    /* ignore */
  }
}

// Derive a rate-limit key from the request. We use the platform-trusted proxy
// headers. A client can append extra entries to `x-forwarded-for`, but the
// LEFT-MOST entry is the one written by our own proxy/platform and is the one
// we trust; any private left-most value means the chain is missing/forged, so
// we collapse it to a single shared bucket rather than trusting the (spoofable)
// value. Self-hosted deployments behind a known reverse proxy should set
// `x-real-ip` (or a single trusted `x-forwarded-for`).
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (
      first &&
      !first.startsWith("10.") &&
      !first.startsWith("192.168.") &&
      !first.startsWith("172.16.") &&
      !first.startsWith("172.17.") &&
      !first.startsWith("172.18.") &&
      !first.startsWith("172.19.") &&
      !first.startsWith("172.2") &&
      !first.startsWith("172.3") &&
      !first.startsWith("127.") &&
      !first.startsWith("169.254.") &&
      !/^\s*$/.test(first)
    ) {
      return first;
    }
    return "private";
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "unknown";
}

export function getRateLimitKey(request: NextRequest): string {
  return getClientIp(request);
}

export async function checkRateLimit(key: string): Promise<boolean> {
  await ensureRateLimitSchema();
  await purgeExpired();
  const now = Date.now();

  try {
    const row = await selectOne(
      "SELECT count, reset_at FROM rate_limit WHERE key = ?",
      [key]
    ) as { count: number; reset_at: number } | undefined;

    if (!row || now > row.reset_at) {
      await executeInsert(
        `INSERT INTO rate_limit (key, count, reset_at) VALUES (?, 1, ?)
         ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at`,
        [key, now + WINDOW_MS]
      );
      return true;
    }

    if (row.count >= MAX_ATTEMPTS) return false;

    await executeUpdate(
      "UPDATE rate_limit SET count = count + 1 WHERE key = ?",
      [key]
    );
    return true;
  } catch {
    // Fallback to in-memory if DB fails
    const entry = memoryFallback.get(key);
    if (!entry || now > entry.resetAt) {
      memoryFallback.set(key, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }
    if (entry.count >= MAX_ATTEMPTS) return false;
    entry.count++;
    return true;
  }
}

export async function resetRateLimit(key: string): Promise<void> {
  try {
    await ensureRateLimitSchema();
    await executeUpdate("DELETE FROM rate_limit WHERE key = ?", [key]);
  } catch {
    memoryFallback.delete(key);
  }
}

export async function checkPublicRateLimit(key: string, maxAttempts: number = 10): Promise<boolean> {
  await ensureRateLimitSchema();
  await purgeExpired();
  const now = Date.now();
  const fullKey = `pub:${key}`;

  try {
    const row = await selectOne(
      "SELECT count, reset_at FROM rate_limit WHERE key = ?",
      [fullKey]
    ) as { count: number; reset_at: number } | undefined;

    if (!row || now > row.reset_at) {
      await executeInsert(
        `INSERT INTO rate_limit (key, count, reset_at) VALUES (?, 1, ?)
         ON CONFLICT(key) DO UPDATE SET count = 1, reset_at = excluded.reset_at`,
        [fullKey, now + WINDOW_MS]
      );
      return true;
    }

    if (row.count >= maxAttempts) return false;

    await executeUpdate(
      "UPDATE rate_limit SET count = count + 1 WHERE key = ?",
      [fullKey]
    );
    return true;
  } catch {
    const entry = memoryFallback.get(fullKey);
    if (!entry || now > entry.resetAt) {
      memoryFallback.set(fullKey, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }
    if (entry.count >= maxAttempts) return false;
    entry.count++;
    return true;
  }
}
