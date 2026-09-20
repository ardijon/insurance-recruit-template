"use client";

import { useEffect, useState, useCallback } from "react";
import { toPersianDigits } from "@/lib/jalali";
import { adminFetch } from "@/lib/api-client";

interface ReleaseEntry {
  version: string;
  date: string;
  title: string;
  notes: string[];
  isNew: boolean;
}

interface UpdateCenterInfo {
  configured: boolean;
  error?: "fetch_failed" | "invalid_feed";
  currentVersion: string;
  releases: ReleaseEntry[];
  deployHookConfigured?: boolean;
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

export default function UpdatesPage() {
  const [info, setInfo] = useState<UpdateCenterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<string | null>(null);

  const load = useCallback((refresh = false) => {
    adminFetch(`/api/admin/update-center${refresh ? "?refresh=1" : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: UpdateCenterInfo | null) => setInfo(d))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const seenVersion =
    typeof window !== "undefined" ? localStorage.getItem(SEEN_KEY) ?? "" : "";
  const newReleases = (info?.releases ?? []).filter((r) => isNewer(r.version, seenVersion));

  function markSeen() {
    const latest = info?.releases[0];
    if (latest) localStorage.setItem(SEEN_KEY, latest.version);
    window.dispatchEvent(new Event("updates-seen"));
    setInfo((prev) =>
      prev ? { ...prev, releases: prev.releases.map((r) => ({ ...r, isNew: false })) } : prev
    );
  }

  async function handleCheck() {
    setChecking(true);
    load(true);
    setTimeout(() => setChecking(false), 1200);
  }

  async function handleDeploy() {
    if (!confirm("درخواست نصب نسخه جدید به سرویس هاست ارسال شود؟ به‌روزرسانی چند دقیقه طول می‌کشد.")) return;
    setDeploying(true);
    setDeployResult(null);
    try {
      const res = await adminFetch("/api/admin/update-center/deploy", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      setDeployResult(
        res.ok
          ? "درخواست نصب ارسال شد — چند دقیقه دیگر صفحه را رفرش کنید."
          : (data.error ?? "خطا در ارسال درخواست"),
      );
    } catch {
      setDeployResult("خطا در اتصال به سرور");
    } finally {
      setDeploying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-2">به‌روزرسانی محصول</h1>
      <p className="text-sm text-text-secondary mb-6">
        قابلیت‌های جدید و رفع اشکالاتی که سازنده محصول منتشر می‌کند — فقط برای مدیر سایت.
      </p>

      {/* Current version + actions */}
      <div className="mb-6 rounded-2xl border border-border bg-bg-surface p-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-secondary">نسخه نصب‌شده:</span>
          <span className="rounded-full bg-brand-cta/10 px-3 py-1 text-sm font-bold text-brand-cta" dir="ltr">
            {info?.currentVersion ?? "—"}
          </span>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={handleCheck}
          disabled={checking}
          className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-base disabled:opacity-50"
        >
          {checking ? "در حال بررسی..." : "بررسی مجدد"}
        </button>
        {info?.deployHookConfigured && (
          <button
            type="button"
            onClick={handleDeploy}
            disabled={deploying}
            className="rounded-xl bg-brand-cta px-4 py-2 text-sm font-medium text-cta-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {deploying ? "در حال ارسال..." : "نصب نسخه جدید"}
          </button>
        )}
      </div>

      {deployResult && (
        <div
          className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${
            deployResult.startsWith("درخواست")
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          }`}
        >
          {deployResult}
        </div>
      )}

      {/* Feed not configured */}
      {info && !info.configured ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg-surface p-6">
          <p className="text-sm font-bold text-text-primary">کانال به‌روزرسانی پیکربندی نشده است</p>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            متغیر محیطی <code className="rounded bg-bg-base px-1 py-0.5 text-xs" dir="ltr">UPDATE_CHANGELOG_URL</code> را با آدرس فایل
            <code className="mx-1 rounded bg-bg-base px-1 py-0.5 text-xs" dir="ltr">releases.json</code>
            که سازنده محصول پس از هر انتشار منتشر می‌کند تنظیم کنید.
          </p>
        </div>
      ) : info?.error && (info?.releases.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-border bg-bg-surface p-6 text-sm text-danger">
          خطا در دریافت لیست تغییرات — اتصال اینترنت یا آدرس فید را بررسی کنید.
        </div>
      ) : (info?.releases.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg-surface py-16 text-center">
          <p className="text-sm text-text-secondary">همه‌چیز به‌روز است — نسخه جدیدی منتشر نشده</p>
        </div>
      ) : (
        <>
          {info!.error && (
            <div className="mb-4 rounded-xl border border-danger/30 bg-danger/5 px-4 py-3 text-xs leading-relaxed text-danger">
              فید راه‌دور در دسترس نیست — لیست تغییرات همراه نصب نمایش داده شده است.
            </div>
          )}
          {newReleases.length > 0 && !info!.deployHookConfigured && (
            <div className="mb-4 rounded-xl border border-border bg-bg-surface px-4 py-3">
              <p className="text-sm font-medium text-text-primary">راهنمای نصب نسخه جدید</p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                سرور شخصی (VPS): با SSH دستور
                <code className="mx-1 rounded bg-bg-base px-1.5 py-0.5 text-xs" dir="ltr">bash scripts/update.sh</code>
                را اجرا کنید. Cloudflare/Vercel: برای نصب، آخرین نسخه را از فروشنده بخواهید.
              </p>
            </div>
          )}

          {newReleases.length > 0 && (
            <div className="mb-4 flex items-center justify-between rounded-xl bg-accent/10 px-4 py-3">
              <p className="text-sm font-bold text-accent">
                {toPersianDigits(newReleases.length)} نسخه جدید موجود است
              </p>
              <button
                type="button"
                onClick={markSeen}
                className="text-xs font-medium text-accent underline hover:opacity-80"
              >
                علامت‌گذاری خوانده‌شده
              </button>
            </div>
          )}

          <div className="space-y-3">
            {info!.releases.map((release) => (
              <div
                key={release.version}
                className={`rounded-2xl border p-4 ${
                  release.isNew ? "border-accent/40 bg-accent/5" : "border-border bg-bg-surface"
                }`}
              >
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="rounded-full bg-brand-cta/10 px-2.5 py-0.5 text-xs font-bold text-brand-cta" dir="ltr">
                    {release.version}
                  </span>
                  <span className="text-sm font-bold text-text-primary">{release.title}</span>
                  {release.isNew && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-bold text-accent">
                      جدید
                    </span>
                  )}
                  {info!.deployHookConfigured && isNewer(release.version, info!.currentVersion) && (
                    <span className="text-[10px] text-text-secondary">— برای دریافت، «نصب نسخه جدید» را بزنید</span>
                  )}
                </div>
                {release.date && (
                  <p className="mt-1 text-[11px] text-text-secondary" dir="ltr">{release.date}</p>
                )}
                {release.notes.length > 0 && (
                  <ul className="mt-2 space-y-1">
                    {release.notes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-text-secondary">
                        <span className="mt-2 size-1 shrink-0 rounded-full bg-text-secondary/50" />
                        {note}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
