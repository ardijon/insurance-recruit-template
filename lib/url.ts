const SAFE_PROTOCOLS = new Set(["https:", "http:"]);

export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  try {
    const parsed = new URL(trimmed);
    if (!SAFE_PROTOCOLS.has(parsed.protocol)) return "";
    return parsed.href;
  } catch {
    if (/^[a-zA-Z0-9]/.test(trimmed)) {
      return `https://${trimmed}`;
    }
    return "";
  }
}

export function isValidSocialUrl(url: string): boolean {
  return sanitizeUrl(url) !== "";
}
