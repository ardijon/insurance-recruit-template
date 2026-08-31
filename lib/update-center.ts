// lib/update-center.ts
//
// لایه ۱ مرکز به‌روزرسانی: نسخه فعلی + چنج‌لاگ نسخه‌های منتشرشده.
// هر دیپلوی خریدار مستقلاً فایل changelog عمومی شما (مالک محصول) را
// سمت سرور می‌خواند — بدون سرور مرکزی و بدون توکن در کد کلاینت.
//
// env هر دیپلوی خریدار:
//   UPDATE_CHANGELOG_URL  آدرس عمومی releases.json (از مالک محصول)
//   APP_VERSION           اختیاری — نسخه نصب‌شده؛ پیش‌فرض از package.json

import { readFileSync } from "node:fs";
import path from "node:path";

export interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  notes: string[];
  isNew: boolean;
}

export interface UpdateCenterInfo {
  configured: boolean;
  error?: "fetch_failed" | "invalid_feed";
  currentVersion: string;
  releases: ReleaseEntry[];
}

export function getCurrentVersion(): string {
  if (process.env.APP_VERSION) return process.env.APP_VERSION.trim();
  try {
    const pkg = JSON.parse(readFileSync(path.join(process.cwd(), "package.json"), "utf-8")) as {
      version?: string;
    };
    return (pkg.version ?? "unknown").trim();
  } catch {
    return "unknown";
  }
}

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

function clamp(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export async function fetchRemoteReleases(noStore: boolean): Promise<UpdateCenterInfo> {
  const url = (process.env.UPDATE_CHANGELOG_URL ?? "").trim();
  const currentVersion = getCurrentVersion();

  if (!url) {
    return { configured: false, currentVersion, releases: [] };
  }

  try {
    const res = await fetch(url, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8000),
      // حالت عادی کش یک‌ساعته؛ با refresh=1 بدون کش برای «بررسی مجدد»
      ...(noStore ? { cache: "no-store" } : { next: { revalidate: 3600 } }),
    });
    if (!res.ok) throw new Error(`status ${res.status}`);
    const data: unknown = await res.json();

    const raw = Array.isArray(data) ? data : (data as { releases?: unknown[] })?.releases;
    if (!Array.isArray(raw)) throw new Error("invalid shape");

    const releases: ReleaseEntry[] = raw
      .map((item): ReleaseEntry | null => {
        const r = item as Record<string, unknown>;
        const version = clamp(r.version, 30);
        const title = clamp(r.title, 200);
        if (!version || !title) return null;
        const notes = Array.isArray(r.notes)
          ? r.notes.map((n) => clamp(n, 300)).filter((n) => n.length > 0).slice(0, 20)
          : [];
        return {
          version,
          date: clamp(r.date, 20),
          title,
          notes,
          isNew: isNewerVersion(version, currentVersion),
        };
      })
      .filter((r): r is ReleaseEntry => r !== null)
      .sort((a, b) =>
        isNewerVersion(a.version, b.version) ? -1 : isNewerVersion(b.version, a.version) ? 1 : 0
      )
      .slice(0, 30);

    return { configured: true, currentVersion, releases };
  } catch {
    return { configured: true, error: "fetch_failed", currentVersion, releases: [] };
  }
}
