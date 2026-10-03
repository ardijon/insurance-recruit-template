"use client";

import { useEffect, useState, useCallback } from "react";
import { adminFetch } from "@/lib/api-client";
import { isNewerVersion } from "@/lib/version";

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

export function useUpdateBadge(): number {
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    adminFetch("/api/admin/update-center")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: UpdateCenterInfo | null) => {
        if (!d || !d.configured || d.error) return;
        const seen = localStorage.getItem(SEEN_KEY) ?? "";
        setCount(d.releases.filter((rel) => rel.isNew && isNewerVersion(rel.version, seen)).length);
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
