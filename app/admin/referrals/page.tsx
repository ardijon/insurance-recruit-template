"use client";

import { useEffect, useState } from "react";
import { ToastContainer } from "@/components/toast";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/api-client";
import { toPersianDigits } from "@/lib/jalali";

interface ReferralLink {
  id: number;
  agent_name: string;
  code: string;
  created_at: string;
  uses: number;
}

export default function ReferralsPage() {
  const [items, setItems] = useState<ReferralLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);
  const { toasts, addToast, removeToast } = useToast();

  function load() {
    adminFetch("/api/referrals")
      .then((res) => res.json())
      .then((d) => setItems(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function fullLink(c: string): string {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}/?ref=${encodeURIComponent(c)}`;
  }

  async function handleAdd() {
    if (!agentName.trim() || !code.trim()) return;
    setSaving(true);
    try {
      const res = await adminFetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName.trim(), code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "");
      setAgentName(""); setCode(""); setShowForm(false);
      addToast("لینک معرف ساخته شد");
      load();
    } catch (err) {
      addToast(err instanceof Error && err.message ? err.message : "خطا در ساخت لینک", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا از حذف این لینک اطمینان دارید؟")) return;
    try {
      const res = await adminFetch(`/api/referrals?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      addToast("حذف شد");
      load();
    } catch { addToast("خطا در حذف", "error"); }
  }

  async function handleCopy(c: string) {
    try {
      await navigator.clipboard.writeText(fullLink(c));
      addToast("لینک کپی شد");
    } catch { addToast("کپی نشد", "error"); }
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
        <div>
          <h1 className="text-2xl font-bold text-text-primary">لینک‌های معرف</h1>
          <p className="mt-1 text-sm text-text-secondary">
            برای هر نماینده یک کد بسازید و لینک را به او بدهید؛ متقاضیانی که با آن لینک ثبت‌نام کنند با همین کد در جدول متقاضیان مشخص می‌شوند.
          </p>
        </div>
        <button type="button" onClick={() => setShowForm(!showForm)} className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-cta-contrast transition-opacity hover:opacity-90">
          {showForm ? "انصراف" : "ساخت لینک جدید"}
        </button>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-bg-surface p-4 flex flex-col gap-3 animate-fade-in">
          <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="نام نماینده (مثال: علی محمدی)" className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta" />
          <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="کد (انگلیسی، مثال: ALI2024)" dir="ltr" className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta text-left" />
          <p className="text-xs text-text-secondary">کد فقط حروف انگلیسی، عدد، ‎-‎ و ‎_‎ (بین ۳ تا ۳۲ کاراکتر)</p>
          <button type="button" onClick={handleAdd} disabled={!agentName.trim() || !code.trim() || saving} className="self-start rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-cta-contrast transition-opacity hover:opacity-90 disabled:opacity-50">
            {saving ? "در حال ساخت..." : "ساخت لینک"}
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface py-16 text-center">
          <p className="text-text-secondary">هنوز لینک معرفی ساخته نشده است</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="rounded-xl border border-border bg-bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-text-primary">{item.agent_name}</p>
                  <p className="mt-1 text-sm text-text-secondary ltr" dir="ltr">
                    <span className="font-medium text-brand-cta">{item.code}</span>
                    {" · "}
                    {toPersianDigits(item.uses)} ثبت‌نام
                  </p>
                  <p className="mt-1 text-xs text-text-secondary break-all ltr" dir="ltr">{fullLink(item.code)}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => handleCopy(item.code)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base">
                    کپی لینک
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="rounded-lg border border-danger/30 px-3 py-1.5 text-xs text-danger transition-colors hover:bg-danger hover:text-cta-contrast">
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
