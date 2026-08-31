"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/api-client";

interface ReleaseEntry {
  version: string;
  isNew: boolean;
}

interface UpdateCenterInfo {
  configured: boolean;
  error?: string;
  currentVersion: string;
  releases: ReleaseEntry[];
}

const SEEN_KEY = "updates_seen_version";

function isNewer(a: string, b: string): boolean {
  const pa = a.replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
  const pb = b.replace(/[^0-9.]/g, "").split(".").map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length);
  for (let i = 0; i < len; i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d > 0;
  }
  return false;
}

// زنگ اعلان نسخه جدید — منطق مشترک: تعداد نسخه‌های منتشرشدهٔ جدیدتر از
// آخرین نسخهٔ «دیده‌شده» را برمی‌گرداند (برای نشان کنار آیتم منو).
export function useUpdateBadge(): number {
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    adminFetch("/api/admin/update-center")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: UpdateCenterInfo | null) => {
        if (!d || !d.configured || d.error) return;
        const seen = localStorage.getItem(SEEN_KEY) ?? "";
        setCount(d.releases.filter((rel) => rel.isNew && isNewer(rel.version, seen)).length);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 6 * 60 * 60 * 1000);
    window.addEventListener("updates-seen", load);
    return () => {
      clearInterval(interval);
      window.removeEventListener("updates-seen", load);
    };
  }, [load]);

  return count;
}
