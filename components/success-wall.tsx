"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { QuoteIcon } from "@/components/icons";

export interface SuccessWallEntry {
  id: number;
  agentName: string;
  quote: string;
  images_json?: string;
}

export function SuccessWall({ entries }: { entries: SuccessWallEntry[] }) {
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  if (entries.length === 0) return null;

  return (
    <>
      <section
        id="success-wall"
        aria-labelledby="success-wall-heading"
        className="bg-bg-surface py-16 md:py-20"
      >
        <div className="mx-auto max-w-6xl px-4">
          <h2
            id="success-wall-heading"
            className="mb-10 text-center text-2xl font-bold text-brand-emphasis md:text-3xl"
          >
            دیوار موفقیت تیم
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <SuccessCard key={entry.id} entry={entry} onImageClick={setLightboxImg} />
            ))}
          </div>
        </div>
      </section>

      {lightboxImg && (
        <Lightbox src={lightboxImg} onClose={() => setLightboxImg(null)} />
      )}
    </>
  );
}

function SuccessCard({ entry, onImageClick }: { entry: SuccessWallEntry; onImageClick: (src: string) => void }) {
  const images = (() => {
    if (!entry.images_json) return [];
    try { return JSON.parse(entry.images_json) as string[]; } catch { return []; }
  })();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIdx(idx);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <article className="group relative rounded-xl border border-border bg-bg-base shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
      {/* Quote text — first, so it's never hidden */}
      <div className="p-5">
        <div className="absolute right-0 top-0 h-full w-1 rounded-r-xl bg-accent/30 transition-colors group-hover:bg-accent/60" />
        <QuoteIcon className="mb-2 size-7 text-accent/20" />
        <p className="leading-relaxed text-text-primary text-sm">{entry.quote}</p>

        <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent animate-scale-in">
            {entry.agentName.charAt(0)}
          </span>
          <span className="text-sm font-medium text-text-secondary">{entry.agentName}</span>
        </div>
      </div>

      {/* Carousel — below text */}
      {images.length > 0 && (
        <div className="relative border-t border-border">
          <div
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onImageClick(img)}
                className="relative shrink-0 w-full snap-center"
              >
                <div className="relative h-40 w-full">
                  {idx > 0 && (
                    <div className="absolute inset-0 translate-x-1 translate-y-1 scale-[0.95] rounded-lg bg-bg-surface shadow-sm" />
                  )}
                  {idx > 0 && (
                    <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 scale-[0.97] rounded-lg bg-bg-surface shadow-md" />
                  )}
                  <Image
                    src={img}
                    alt={`لوح تقدیر ${entry.agentName}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="relative rounded-lg object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, idx) => (
                <span
                  key={idx}
                  className={`size-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIdx ? "bg-brand-cta w-4" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image count badge */}
          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-xs text-white backdrop-blur-sm">
            <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            {images.length}
          </span>
        </div>
      )}
    </article>
  );
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={(e) => setTouchStart(e.touches[0].clientY)}
      onTouchEnd={(e) => {
        if (touchStart !== null && Math.abs(e.changedTouches[0].clientY - touchStart) > 80) onClose();
        setTouchStart(null);
      }}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-10 size-10 flex items-center justify-center rounded-full bg-white/10 text-white text-lg hover:bg-white/20 transition-colors"
      >
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        src={src}
        alt=""
        className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}