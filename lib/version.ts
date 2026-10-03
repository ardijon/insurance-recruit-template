/** -1 / 0 / 1 — مقایسه عددی نسخه‌ها ("1.10.0" > "1.9.0") */
export function compareVersions(a: string, b: string): number {
  const pa = a.replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return 0;
}

export function isNewerVersion(a: string, b: string): boolean {
  return compareVersions(a, b) > 0;
}
