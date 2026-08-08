"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-red-700">خطا در بارگذاری</h2>
        <p className="mb-4 text-sm text-red-600">{error.message || "خطای غیرمنتظره‌ای رخ داد"}</p>
        <button
          type="button"
          onClick={reset}
          className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
