"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { ToastContainer } from "@/components/toast";
import type { Toast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/api-client";

export default function VisualStoryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdRef = useRef(0);

  function addToast(message: string, type: "success" | "error" = "success") {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }

  useEffect(() => {
    adminFetch("/api/admin/visual-story")
      .then((res) => res.json())
      .then((d) => { try { setImages(JSON.parse(d.images_json)); } catch { setImages([]); } })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      addToast("حجم عکس بیشتر از ۲ مگابایت است", "error");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await adminFetch("/api/admin/visual-story-images", { method: "POST", body: formData });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setImages(result.images);
      addToast("عکس اضافه شد");
    } catch {
      addToast("خطا در آپلود", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleRemove(imageUrl: string) {
    if (!confirm("حذف این عکس؟")) return;
    try {
      const res = await adminFetch("/api/admin/visual-story-images", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl }),
      });
      if (!res.ok) throw new Error();
      const result = await res.json();
      setImages(result.images);
      addToast("عکس حذف شد");
    } catch {
      addToast("خطا در حذف", "error");
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
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">روایت تصویری موفقیت</h1>
          <p className="mt-1 text-sm text-text-secondary">عکس‌های افتخارات، لوح‌ها و مدال‌های نمایندگان</p>
        </div>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {uploading ? "در حال آپلود..." : "+ افزودن عکس"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl border border-border bg-bg-surface py-16 text-center">
          <p className="text-text-secondary">هنوز عکسی اضافه نشده است</p>
          <p className="mt-1 text-xs text-text-secondary">حداکثر ۲ مگابایت برای هر عکس</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-bg-surface">
              <button type="button" onClick={() => setLightboxIdx(idx)} className="size-full">
                <Image src={img} alt="" fill sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw" className="object-cover" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(img); }}
                className="absolute top-2 left-2 size-7 flex items-center justify-center rounded-full bg-red-500/80 text-white text-xs opacity-70 hover:opacity-100 active:opacity-100 transition-opacity"
                title="حذف عکس"
              >
                ×
              </button>
              <span className="absolute bottom-1 right-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setLightboxIdx(null)}>
          <button type="button" onClick={() => setLightboxIdx(null)} className="absolute top-4 left-4 z-10 size-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {images.length > 1 && (
            <>
              <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => p !== null ? (p > 0 ? p - 1 : images.length - 1) : null); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
              </button>
              <button type="button" onClick={(e) => { e.stopPropagation(); setLightboxIdx((p) => p !== null ? (p < images.length - 1 ? p + 1 : 0) : null); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </button>
            </>
          )}
          <Image src={images[lightboxIdx]} alt="" width={1200} height={800} unoptimized className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
            {lightboxIdx + 1} / {images.length}
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={(id: number) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}