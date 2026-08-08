"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ToastContainer } from "@/components/toast";
import type { Toast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/api-client";

interface Entry {
  id: number;
  agent_name: string;
  quote: string;
  images_json: string;
  permission_granted: number;
  sort_order: number;
}

export default function SuccessWallPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [quote, setQuote] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editQuote, setEditQuote] = useState("");
  const [editPermission, setEditPermission] = useState(0);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const fileRefs = useRef<Map<number, HTMLInputElement>>(new Map());
  let toastId = 0;

  function addToast(message: string, type: "success" | "error" = "success") {
    const id = toastId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  function load() {
    adminFetch("/api/admin/success-wall")
      .then((res) => res.json())
      .then((d) => { setEntries(d); setDirty(false); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function getImages(entry: Entry): string[] {
    try { return JSON.parse(entry.images_json); } catch { return []; }
  }

  async function handleAdd() {
    if (!agentName.trim() || !quote.trim()) return;
    try {
      const res = await adminFetch("/api/admin/success-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_name: agentName, quote, images_json: "[]", permission_granted: true, sort_order: entries.length }),
      });
      if (!res.ok) throw new Error();
      setAgentName(""); setQuote(""); setShowForm(false);
      addToast("با موفقیت اضافه شد");
      load();
    } catch { addToast("خطا در افزودن", "error"); }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا از حذف این آیتم اطمینان دارید؟")) return;
    try {
      const res = await adminFetch(`/api/admin/success-wall?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      addToast("حذف شد");
      load();
    } catch { addToast("خطا در حذف", "error"); }
  }

  async function handleEdit(item: Entry) {
    if (!editName.trim() || !editQuote.trim()) return;
    try {
      const res = await adminFetch("/api/admin/success-wall", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, agent_name: editName, quote: editQuote, permission_granted: editPermission }),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      addToast("ویرایش شد");
      load();
    } catch { addToast("خطا در ویرایش", "error"); }
  }

  function startEdit(item: Entry) {
    setEditingId(item.id);
    setEditName(item.agent_name);
    setEditQuote(item.quote);
    setEditPermission(item.permission_granted);
  }

  async function handleImageUpload(entryId: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast("حجم عکس بیشتر از ۲ مگابایت است", "error");
      return;
    }

    setUploadingId(entryId);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("entry_id", String(entryId));
      const res = await adminFetch("/api/admin/success-wall-images", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      addToast("عکس اضافه شد");
      load();
    } catch { addToast("خطا در آپلود", "error"); }
    finally { setUploadingId(null); e.target.value = ""; }
  }

  async function handleRemoveImage(entryId: number, imageUrl: string) {
    if (!confirm("حذف این عکس؟")) return;
    try {
      const res = await adminFetch("/api/admin/success-wall-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entry_id: entryId, image_url: imageUrl }),
      });
      if (!res.ok) throw new Error();
      addToast("عکس حذف شد");
      load();
    } catch { addToast("خطا در حذف عکس", "error"); }
  }

  function handleDragStart(idx: number) { setDragIndex(idx); }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (dragIndex === null || dragIndex === idx) return;
    const reordered = [...entries];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(idx, 0, moved);
    setEntries(reordered);
    setDragIndex(idx);
    setDirty(true);
  }

  function handleDragEnd() { setDragIndex(null); }

  async function saveOrder() {
    const orders = entries.map((e, i) => ({ id: e.id, sort_order: i }));
    try {
      const res = await adminFetch("/api/admin/success-wall", {
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
        <h1 className="text-2xl font-bold text-text-primary">دیوار موفقیت</h1>
        <div className="flex gap-2">
          {dirty && (
            <button type="button" onClick={saveOrder} className="rounded-lg bg-success px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
              ذخیره ترتیب جدید
            </button>
          )}
          <button type="button" onClick={() => setShowForm(!showForm)} className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
            {showForm ? "انصراف" : "افزودن"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="mb-6 rounded-xl border border-border bg-bg-surface p-4 flex flex-col gap-3 animate-fade-in">
          <input type="text" value={agentName} onChange={(e) => setAgentName(e.target.value)} placeholder="نام نماینده" className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta" />
          <textarea value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="نقل قول" rows={2} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta resize-none" />
          <button type="button" onClick={handleAdd} disabled={!agentName.trim() || !quote.trim()} className="self-start rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
            افزودن به دیوار
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface py-16 text-center">
          <p className="text-text-secondary">هیچ نماینده‌ای ثبت نشده است</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((e, idx) => {
            const images = getImages(e);
            return (
              <div
                key={e.id}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(ev) => handleDragOver(ev, idx)}
                onDragEnd={handleDragEnd}
                className={`rounded-xl border bg-bg-surface p-4 transition-shadow hover:shadow-sm ${dragIndex === idx ? "opacity-50" : ""} ${dragIndex !== null && dragIndex !== idx ? "cursor-grab" : ""}`}
              >
                {editingId === e.id ? (
                  <div className="flex flex-col gap-3">
                    <input type="text" value={editName} onChange={(ev) => setEditName(ev.target.value)} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta" />
                    <textarea value={editQuote} onChange={(ev) => setEditQuote(ev.target.value)} rows={2} className="rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2 focus:outline-none focus:ring-2 focus:ring-brand-cta resize-none" />
                    <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
                      <input type="checkbox" checked={editPermission === 1} onChange={(ev) => setEditPermission(ev.target.checked ? 1 : 0)} className="rounded border-border accent-brand-cta" />
                      مجاز برای انتشار
                    </label>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => handleEdit(e)} disabled={!editName.trim() || !editQuote.trim()} className="rounded-lg bg-success px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">ذخیره</button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-border px-4 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base">انصراف</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <button type="button" onClick={() => startEdit(e)} className="text-right font-bold text-text-primary hover:text-brand-cta transition-colors">{e.agent_name}</button>
                        <p className="mt-1 text-sm text-text-secondary line-clamp-2">{e.quote}</p>
                        <span className={`mt-2 inline-block text-xs px-2 py-0.5 rounded-full ${e.permission_granted ? "bg-success/10 text-success" : "bg-red-500/10 text-red-500"}`}>
                          {e.permission_granted ? "مجاز برای انتشار" : "عدم مجوز"}
                        </span>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button type="button" onClick={() => startEdit(e)} className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base">ویرایش</button>
                        <button type="button" onClick={() => handleDelete(e.id)} className="rounded-lg border border-red-500/30 px-3 py-1.5 text-xs text-red-500 transition-colors hover:bg-red-500 hover:text-white">حذف</button>
                      </div>
                    </div>

                    {/* Image gallery */}
                    <div className="border-t border-border pt-3">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <button
                          type="button"
                          onClick={() => fileRefs.current.get(e.id)?.click()}
                          disabled={uploadingId === e.id}
                          className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:bg-bg-base disabled:opacity-50"
                        >
                          {uploadingId === e.id ? "در حال آپلود..." : "+ افزودن عکس"}
                        </button>
                        <span className="text-xs text-text-secondary">حداکثر ۲ مگابایت</span>
                        <input
                          ref={(el) => { if (el) fileRefs.current.set(e.id, el); }}
                          type="file"
                          accept="image/*"
                          onChange={(ev) => handleImageUpload(e.id, ev)}
                          className="hidden"
                        />
                      </div>
                      {images.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {images.map((img, i) => (
                            <div key={i} className="relative group size-20 overflow-hidden rounded-lg border border-border">
                              <button type="button" onClick={() => setLightboxImg(img)} className="size-full">
                                <Image src={img} alt="" width={80} height={80} className="size-full object-cover" loading="lazy" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(e.id, img)}
                                className="absolute top-0.5 left-0.5 size-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightboxImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setLightboxImg(null)}>
          <button type="button" onClick={() => setLightboxImg(null)} className="absolute top-4 left-4 size-10 flex items-center justify-center rounded-full bg-white/10 text-white text-lg hover:bg-white/20 transition-colors">
            ×
          </button>
          <img src={lightboxImg} alt="" className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={(id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}