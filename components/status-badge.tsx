"use client";

import { useRef, useEffect, memo } from "react";

export const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  new: { label: "جدید", bg: "bg-brand-cta/10", text: "text-brand-cta" },
  contacted: { label: "تماس گرفته شده", bg: "bg-accent/10", text: "text-accent" },
  interviewed: { label: "مصاحبه شده", bg: "bg-blue-500/10", text: "text-blue-500" },
  hired: { label: "جذب شده", bg: "bg-success/10", text: "text-success" },
  rejected: { label: "رد شده", bg: "bg-red-500/10", text: "text-red-500" },
};

interface Props {
  status: string;
  onChange: (status: string) => void;
  editable?: boolean;
}

export const StatusBadge = memo(function StatusBadge({ status, onChange, editable = false }: Props) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.new;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editable) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        ref.current.querySelector<HTMLDetailsElement>("details")?.removeAttribute("open");
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [editable]);

  if (!editable) {
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  }

  return (
    <div ref={ref} className="relative">
      <details className="group">
        <summary className={`cursor-pointer list-none inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${config.bg} ${config.text} hover:opacity-80 transition-opacity`}>
          {config.label}
          <svg className="mr-1 size-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </summary>
        <div className="absolute right-0 z-50 mt-1 w-40 rounded-xl border border-border bg-bg-base shadow-lg">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                onChange(key);
                ref.current?.querySelector<HTMLDetailsElement>("details")?.removeAttribute("open");
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-bg-surface ${
                key === status ? "font-bold" : ""
              }`}
            >
              <span className={`inline-block size-2 rounded-full ${cfg.bg.replace("/10", "")}`} />
              {cfg.label}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
});
