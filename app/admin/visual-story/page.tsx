"use client";

import { useEffect, useState, useRef } from "react";
import { ToastContainer } from "@/components/toast";
import { useToast } from "@/hooks/use-toast";
import { adminFetch } from "@/lib/api-client";
import { Lightbox } from "@/components/lightbox";

export default function VisualStoryPage() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toasts, addToast, removeToast } = useToast();

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
          className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-cta-contrast transition-opacity hover:opacity-90 disabled:opacity-50"
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
              <button type="button" onClick={() => setLightboxIdx(idx)} className="size-full" aria-label={`مشاهده تصویر ${idx + 1} روایت موفقیت`}>
                <img src={img} alt={`تصویر ${idx + 1} روایت موفقیت`} width={600} height={450} loading="lazy" decoding="async" sizes="(max-width: 768px) 50vw, 25vw" className="absolute inset-0 size-full object-cover" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(img); }}
                className="absolute top-2 left-2 size-7 flex items-center justify-center rounded-full bg-danger/80 text-cta-contrast text-xs opacity-70 hover:opacity-100 active:opacity-100 transition-opacity"
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

      {lightboxIdx !== null && (
        <Lightbox images={images} imageAlts={images.map((_, i) => `تصویر ${i + 1} روایت موفقیت`)} initialIdx={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}