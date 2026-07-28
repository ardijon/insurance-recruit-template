"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "@/components/toast";
import { calculateGrowthScore, toPersianNumbers, type GrowthScoreResult } from "@/lib/growth-score";
import type { Toast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/api-client";

interface Stage {
  id: number;
  title: string;
  description: string;
  sort_order: number;
}

interface ProfileData {
  position_start_date: string;
  current_agent_count: number;
  growth_agents_6m: number | null;
  growth_agents_1y: number | null;
  growth_agents_2y: number | null;
  growth_policies_6m: number | null;
  growth_policies_1y: number | null;
  growth_policies_2y: number | null;
}

export default function GrowthPathPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [score, setScore] = useState<GrowthScoreResult | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  let toastId = 0;

  function addToast(message: string, type: "success" | "error" = "success") {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  function load() {
    adminFetch("/api/admin/growth-path")
      .then((res) => res.json())
      .then((d) => { setStages(d); setDirty(false); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  useEffect(() => {
    adminFetch("/api/admin/profile")
      .then((res) => res.json())
      .then((d: ProfileData) => setScore(calculateGrowthScore(d)))
      .catch(() => {});
  }, []);

  async function handleAdd() {
    if (!title.trim()) return;
    try {
      const res = await adminFetch("/api/admin/growth-path", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, sort_order: stages.length }),
      });
      if (!res.ok) throw new Error();
      setTitle(""); setDescription(""); setShowForm(false);
      addToast("مرحله جدید اضافه شد");
      load();
    } catch { addToast("خطا در افزودن", "error"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا از حذف این مرحله اطمینان دارید؟")) return;
    try {
      const res = await adminFetch(`/api/admin/growth-path?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      addToast("حذف شد");
      load();
    } catch { addToast("خطا در حذف", "error"); }
  }

  async function handleEdit(item: Stage) {
    if (!editTitle.trim()) return;
    try {
      const res = await adminFetch("/api/admin/growth-path", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, title: editTitle, description: editDescription }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      addToast("ویرایش شد");
      load();
    } catch { addToast("خطا در ویرایش", "error"); }
  }

  function startEdit(item: Stage) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleDragStart(idx: number) {
    setDragIndex(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const reordered = [...stages];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(idx, 0, moved);
    setStages(reordered);
    setDragIndex(idx);
    setDirty(true);
  }

  function handleDragEnd() {
    setDragIndex(null);
  }

  async function saveOrder() {
    const orders = stages.map((s, i) => ({ id: s.id, sort_order: i }));
    try {
      const res = await adminFetch("/api/admin/growth-path", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders }),
      });
      if (!res.ok) throw new Error();
      setDirty(false);
      addToast("ترتیب ذخیره شد");
    } catch { addToast("خطا در ذخیره ترتیب", "error"); }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-text-primary">مسیر رشد نمایندگان</h1>
        <div className="flex gap-2">
          {dirty && (
            <button type="button" onClick={saveOrder} className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              ذخیره ترتیب جدید
            </button>
          )}
          <button type="button" onClick={() => setShowForm(!showForm)} className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
            {showForm ? "انصراف" : "افزودن مرحله"}
          </button>
        </div>
      </div>

      {/* Score card */}
      {score && (
        <div className="mb-6 rounded-2xl border border-border bg-bg-surface p-5">
          <div className="flex items-center gap-6">
            {/* Circle score */}
            <div className="relative shrink-0">
              <svg className="size-24 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-border)"
                  strokeWidth="2"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="var(--color-brand-cta)"
                  strokeWidth="2"
                  strokeDasharray={`${score.total}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-sm font-extrabold ${score.gradeColor}`}>{score.grade}</span>
                <span className="text-[10px] text-text-secondary">{toPersianNumbers(score.total)}/۱۰۰</span>
              </div>
            </div>

            {/* Breakdown */}
            <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-bg-base px-3 py-2">
                <p className="text-xs text-text-secondary">سابقه سمت</p>
                <p className="font-bold text-text-primary">{toPersianNumbers(score.tenure)}/۲۵</p>
              </div>
              <div className="rounded-lg bg-bg-base px-3 py-2">
                <p className="text-xs text-text-secondary">تعداد نماینده</p>
                <p className="font-bold text-text-primary">{toPersianNumbers(score.agents)}/۲۵</p>
              </div>
              <div className="rounded-lg bg-bg-base px-3 py-2">
                <p className="text-xs text-text-secondary">رشد نمایندگان</p>
                <p className="font-bold text-text-primary">{toPersianNumbers(score.agentGrowth)}/۲۵</p>
              </div>
              <div className="rounded-lg bg-bg-base px-3 py-2">
                <p className="text-xs text-text-secondary">رشد بیمه‌نامه</p>
                <p className="font-bold text-text-primary">{toPersianNumbers(score.policyGrowth)}/۲۵</p>
              </div>
            </div>
          </div>
          <p className={`mt-3 text-sm font-medium ${score.gradeColor}`}>{score.summary}</p>
          
          {/* دکمه راهنما */}
          <button
            type="button"
            onClick={() => setShowGuide(true)}
            className="mt-3 flex items-center gap-1 text-xs text-text-secondary hover:text-brand-cta transition-colors"
          >
            <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            راهنمای عملکرد
          </button>
        </div>
      )}

      {/* پاپ‌آپ راهنما */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-bg-surface p-6 shadow-xl">
            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="absolute left-4 top-4 size-8 flex items-center justify-center rounded-full bg-bg-base text-text-secondary hover:text-text-primary transition-colors"
            >
              ✕
            </button>
            <h3 className="mb-4 text-lg font-bold text-text-primary">راهنمای عملکرد</h3>
            <div className="space-y-3 text-sm text-text-secondary">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-cta" />
                <span><strong>سابقه سمت:</strong> مدت زمان فعالیت شما در سمت فعلی (حداکثر ۲۵ امتیاز)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-cta" />
                <span><strong>تعداد نماینده:</strong> تعداد نمایندگان فعال تحت مدیریت شما (حداکثر ۲۵ امتیاز)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-cta" />
                <span><strong>رشد نمایندگان:</strong> درصد افزایش نمایندگان جدید در بازه زمانی مشخص (حداکثر ۲۵ امتیاز)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-brand-cta" />
                <span><strong>رشد بیمه‌نامه:</strong> درصد افزایش صدور بیمه‌نامه‌ها (حداکثر ۲۵ امتیاز)</span>
              </div>
            </div>
            <div className="mt-4 border-t border-border/30 pt-4 text-xs text-text-secondary">
              <strong>نمره کل:</strong> مجموع امتیازات از ۱۰۰
              <div className="mt-2 grid grid-cols-2 gap-1">
                <span>عالی (۸۵+)</span>
                <span>بسیار خوب (۷۰+)</span>
                <span>خوب (۵۵+)</span>
                <span>متوسط (۴۰+)</span>
                <span>نیاز به بهبود (۲۵+)</span>
                <span>ضعیف (کمتر از ۲۵)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-bg-surface p-4 flex flex-col gap-3 animate-fade-in">
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان مرحله" className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta" />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="توضیحات مرحله" rows={2} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta resize-none" />
          <button type="button" onClick={handleAdd} disabled={!title.trim()} className="self-start rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            افزودن مرحله
          </button>
        </div>
      )}

      {stages.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface py-16 text-center">
          <p className="text-text-secondary">هیچ مرحله‌ای تعریف نشده است</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {stages.map((s, idx) => (
            <div
              key={s.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={`rounded-xl border bg-bg-surface p-4 transition-shadow hover:shadow-sm ${dragIndex === idx ? "opacity-50" : ""} ${dragIndex !== null && dragIndex !== idx ? "cursor-grab" : ""}`}
            >
              {editingId === s.id ? (
                <div className="flex flex-col gap-3">
                  <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta" />
                  <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={2} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta resize-none" />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => handleEdit(s)} disabled={!editTitle.trim()} className="rounded-lg bg-success px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                      ذخیره
                    </button>
                    <button type="button" onClick={cancelEdit} className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base">
                      انصراف
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-cta/10 text-sm font-bold text-brand-cta">{idx + 1}</span>
                    <div>
                      <button type="button" onClick={() => startEdit(s)} className="text-right font-bold text-text-primary hover:text-brand-cta transition-colors">{s.title}</button>
                      {s.description && <p className="mt-1 text-sm text-text-secondary">{s.description}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button type="button" onClick={() => startEdit(s)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base">
                      ویرایش
                    </button>
                    <button type="button" onClick={() => handleDelete(s.id)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500 hover:text-white">
                      حذف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}