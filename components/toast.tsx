"use client";

import type { Toast } from "@/hooks/use-toast";

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`animate-fade-up rounded-xl border px-4 py-3 text-sm font-medium shadow-lg backdrop-blur-md ${
            t.type === "success"
              ? "border-success/30 bg-success/10 text-success"
              : "border-red-500/30 bg-red-500/10 text-red-500"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{t.type === "success" ? "✓" : "✕"}</span>
            <span>{t.message}</span>
            <button type="button" onClick={() => onRemove(t.id)} className="mr-2 opacity-60 hover:opacity-100">×</button>
          </div>
        </div>
      ))}
    </div>
  );
}