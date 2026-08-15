"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { ToastContainer } from "@/components/toast";
import { JalaliDatePicker } from "@/components/jalali-date-picker";
import type { Toast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/api-client";

interface ProfileData {
  name: string;
  title: string;
  position_code: string;
  position_start_date: string;
  bio: string;
  achievements: string[];
  current_agent_count: number | null;
  growth_agents_6m: number | null;
  growth_agents_1y: number | null;
  growth_agents_2y: number | null;
  growth_policies_6m: number | null;
  growth_policies_1y: number | null;
  growth_policies_2y: number | null;
  photo_url: string;
}

const INITIAL: ProfileData = {
  name: "",
  title: "",
  position_code: "",
  position_start_date: "",
  bio: "",
  achievements: [],
  current_agent_count: null,
  growth_agents_6m: null,
  growth_agents_1y: null,
  growth_agents_2y: null,
  growth_policies_6m: null,
  growth_policies_1y: null,
  growth_policies_2y: null,
  photo_url: "",
};

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    adminFetch("/api/admin/profile")
      .then((res) => res.json())
      .then((d) => {
        let achievements: string[] = [];
        try {
          const parsed = JSON.parse(d.achievements || "[]");
          if (Array.isArray(parsed)) achievements = parsed;
          else if (typeof parsed === "string" && parsed) achievements = [parsed];
        } catch {
          if (d.achievements) achievements = [d.achievements];
        }
        setData({ ...d, achievements });
      })
      .catch(() => addToast("خطا در بارگذاری", "error"))
      .finally(() => setLoading(false));
  }, [addToast]);

  function setField<K extends keyof ProfileData>(key: K, value: ProfileData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name || null,
          title: data.title || null,
          position_code: data.position_code || null,
          position_start_date: data.position_start_date || null,
          bio: data.bio || null,
          achievements: JSON.stringify(data.achievements.filter(Boolean)),
          current_agent_count: data.current_agent_count,
          growth_agents_6m: data.growth_agents_6m,
          growth_agents_1y: data.growth_agents_1y,
          growth_agents_2y: data.growth_agents_2y,
          growth_policies_6m: data.growth_policies_6m,
          growth_policies_1y: data.growth_policies_1y,
          growth_policies_2y: data.growth_policies_2y,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `خطای سرور (${res.status})`);
      }
      addToast("پروفایل با موفقیت ذخیره شد");
    } catch (e) {
      const message = e instanceof Error ? e.message : "خطا در ذخیره";
      addToast(message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await adminFetch("/api/admin/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setField("photo_url", result.photo_url);
      addToast("عکس با موفقیت آپلود شد");
    } catch {
      addToast("خطا در آپلود عکس", "error");
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      </div>
    );
  }

  const growthFields = [
    { key: "growth_agents_6m" as const, label: "نمایندگان", period: "شش ماه" },
    { key: "growth_agents_1y" as const, label: "نمایندگان", period: "یک سال" },
    { key: "growth_agents_2y" as const, label: "نمایندگان", period: "دو سال" },
    { key: "growth_policies_6m" as const, label: "بیمه‌نامه", period: "شش ماه" },
    { key: "growth_policies_1y" as const, label: "بیمه‌نامه", period: "یک سال" },
    { key: "growth_policies_2y" as const, label: "بیمه‌نامه", period: "دو سال" },
  ];

  return (
    <>
      <h1 className="text-2xl font-bold text-text-primary mb-6">ویرایش پروفایل مدیر</h1>

      <div className="max-w-4xl flex flex-col gap-5">
        {/* Card 1: Identity — photo + name + title + position */}
        <div className="rounded-xl border border-border bg-bg-surface p-5">
          <div className="flex items-start gap-5">
            {/* Photo */}
            <div className="shrink-0">
              <div className="size-20 overflow-hidden rounded-full border-2 border-border bg-bg-base">
                {data.photo_url ? (
                  <Image src={data.photo_url} alt="profile" width={80} height={80} className="size-full object-cover" />
                ) : (
                  <div className="flex size-full items-center justify-center text-text-secondary text-sm">بدون عکس</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-2 w-full rounded-lg bg-brand-cta/10 px-3 py-1.5 text-xs font-medium text-brand-cta transition-colors hover:bg-brand-cta/20 disabled:opacity-50"
              >
                {uploading ? "..." : "انتخاب عکس"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
            {/* Fields */}
            <div className="flex-1 flex flex-col gap-3">
              <input
                type="text"
                value={data.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full rounded-lg border border-border bg-bg-base text-text-primary text-right px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta"
                placeholder="نام مدیر"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setField("title", e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-base text-text-primary text-right px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta"
                  placeholder="سمت مدیریتی"
                />
                <input
                  type="text"
                  value={data.position_code}
                  onChange={(e) => setField("position_code", e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-base text-text-primary text-right px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta"
                  placeholder="کد مدیریتی"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Bio */}
        <div className="rounded-xl border border-border bg-bg-surface p-5">
          <p className="text-sm font-bold text-text-primary mb-3">بیوگرافی</p>
          <textarea
            value={data.bio}
            onChange={(e) => setField("bio", e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border bg-bg-base text-text-primary text-right px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta resize-none"
            placeholder="معرفی کوتاه از خودتان..."
          />
        </div>

        {/* Section: Achievements */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-text-primary">دستاوردها و افتخارات</p>
            <button
              type="button"
              onClick={() => setField("achievements", [...data.achievements, ""])}
              className="flex items-center gap-1 rounded-lg bg-brand-cta/10 px-3 py-1.5 text-xs font-medium text-brand-cta transition-colors hover:bg-brand-cta/20"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              افزودن
            </button>
          </div>
          {data.achievements.length === 0 && (
            <p className="text-xs text-text-secondary mb-2">هنوز دستاوردی اضافه نشده. روی «افزودن» کلیک کنید.</p>
          )}
          <div className="flex flex-col gap-2">
            {data.achievements.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="shrink-0 text-xs text-text-secondary w-5 text-center">{idx + 1}</span>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updated = [...data.achievements];
                    updated[idx] = e.target.value;
                    setField("achievements", updated);
                  }}
                  className="flex-1 rounded-lg border border-border bg-bg-surface text-text-primary text-right px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cta"
                  placeholder="مثلاً: بهترین مدیر فروش سال ۱۴۰۲"
                />
                <button
                  type="button"
                  onClick={() => setField("achievements", data.achievements.filter((_, i) => i !== idx))}
                  className="shrink-0 flex size-7 items-center justify-center rounded-lg text-red-500 transition-colors hover:bg-red-500/10"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Growth stats — agent count + start date + growth */}
        <div className="rounded-xl border border-border bg-bg-surface p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-text-primary">آمار رشد</p>
            <div className="relative w-40">
              <input
                type="number"
                value={data.current_agent_count ?? ""}
                onChange={(e) => setField("current_agent_count", e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-border bg-bg-base text-text-primary text-right px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cta [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="تعداد نمایندگان فعال"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">نفر</span>
            </div>
          </div>
          {/* Start date */}
          <div className="mb-4">
            <JalaliDatePicker
              value={data.position_start_date}
              onChange={(v) => setField("position_start_date", v)}
              placeholder="تاریخ شروع فعالیت در آخرین سمت"
            />
          </div>
          {/* Agents section */}
          <div className="mb-4">
            <p className="text-xs font-medium text-text-secondary mb-2">رشد نمایندگان</p>
            <div className="grid grid-cols-3 gap-3">
              {growthFields.filter(f => f.key.startsWith("growth_agents")).map((f) => (
                <div key={f.key}>
                  <p className="text-[11px] text-text-secondary mb-1">{f.period}</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={data[f.key] ?? ""}
                      onChange={(e) => setField(f.key, e.target.value ? Number(e.target.value) : null)}
                      className="w-full rounded-lg border border-border bg-bg-base text-text-primary text-right px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cta [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">٪</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Policies section */}
          <div>
            <p className="text-xs font-medium text-text-secondary mb-2">رشد بیمه‌نامه</p>
            <div className="grid grid-cols-3 gap-3">
              {growthFields.filter(f => f.key.startsWith("growth_policies")).map((f) => (
                <div key={f.key}>
                  <p className="text-[11px] text-text-secondary mb-1">{f.period}</p>
                  <div className="relative">
                    <input
                      type="number"
                      value={data[f.key] ?? ""}
                      onChange={(e) => setField(f.key, e.target.value ? Number(e.target.value) : null)}
                      className="w-full rounded-lg border border-border bg-bg-base text-text-primary text-right px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cta [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-secondary">٪</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-brand-cta px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
          </button>
        </div>
      </div>

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}
