const rateLimit = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ENTRIES = 1000;

function evictIfNeeded() {
  if (rateLimit.size <= MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of rateLimit) {
    if (now > entry.resetAt) rateLimit.delete(key);
  }
}

function getClientIp(requestHeaders: Headers): string {
  const forwarded = requestHeaders.get("x-forwarded-for");
  if (!forwarded) return "unknown";
  const parts = forwarded.split(",").map((p) => p.trim());
  for (let i = parts.length - 1; i >= 0; i--) {
    const ip = parts[i];
    if (ip && !ip.startsWith("10.") && !ip.startsWith("192.168.") && !ip.startsWith("172.")) {
      return ip;
    }
  }
  return parts[parts.length - 1] || "unknown";
}

export function getRateLimitKey(requestHeaders: Headers): string {
  return getClientIp(requestHeaders);
}

export function checkRateLimit(key: string): boolean {
  evictIfNeeded();
  const now = Date.now();
  const entry = rateLimit.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= MAX_ATTEMPTS) return false;
  entry.count++;
  return true;
}

export function resetRateLimit(key: string): void {
  rateLimit.delete(key);
}

export function checkPublicRateLimit(key: string, maxAttempts: number = 10): boolean {
  const now = Date.now();
  const entry = rateLimit.get(`pub:${key}`);
  if (!entry || now > entry.resetAt) {
    rateLimit.set(`pub:${key}`, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= maxAttempts) return false;
  entry.count++;
  return true;
}
