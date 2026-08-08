"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { QuoteIcon } from "@/components/icons";

export interface SuccessWallEntry {
  id: number;
  agentName: string;
  quote: string;
  images_json?: string;
}

export function SuccessWall({ entries }: { entries: SuccessWallEntry[] }) {
  const [lightboxIdx, setLightboxIdx] = useState<{ images: string[]; idx: number } | null>(null);

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

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {entries.map((entry) => (
              <SuccessCard key={entry.id} entry={entry} onImageClick={(img) => {
                const images = (() => {
                  if (!entry.images_json) return [];
                  try { return JSON.parse(entry.images_json) as string[]; } catch { return []; }
                })();
                const idx = images.indexOf(img);
                setLightboxIdx({ images, idx: idx >= 0 ? idx : 0 });
              }} />
            ))}
          </div>
        </div>
      </section>

      {lightboxIdx && (
        <Lightbox
          images={lightboxIdx.images}
          initialIdx={lightboxIdx.idx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
  );
}

function SuccessCard({ entry, onImageClick }: { entry: SuccessWallEntry; onImageClick: (src: string) => void }) {
  const images = (() => {
    if (!entry.images_json) return [];
    try { return JSON.parse(entry.images_json) as string[]; } catch { return []; }
  })();

  return (
    <article className="group relative flex flex-col rounded-2xl border border-border bg-bg-base shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden">
      {/* Accent bar */}
      <div className="absolute right-0 top-0 h-full w-1 rounded-r-2xl bg-accent/30 transition-colors group-hover:bg-accent/60" />

      {/* Header: avatar + name */}
      <div className="flex flex-col items-center pt-6 pb-3">
        <div className="relative mb-3">
          {images.length > 0 ? (
            <button
              type="button"
              onClick={() => onImageClick(images[0])}
              className="relative size-16 overflow-hidden rounded-full ring-3 ring-accent/20 transition-all group-hover:ring-accent/40 group-hover:scale-105"
            >
              <Image
                src={images[0]}
                alt={entry.agentName}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ) : (
            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 ring-3 ring-accent/20">
              <span className="text-xl font-bold text-accent">
                {entry.agentName.charAt(0)}
              </span>
            </div>
          )}
          {images.length > 1 && (
            <span className="absolute -bottom-1 -left-1 flex size-5 items-center justify-center rounded-full bg-brand-cta text-[10px] font-bold text-white shadow-sm">
              {images.length}
            </span>
          )}
        </div>
        <span className="text-sm font-bold text-text-primary">{entry.agentName}</span>
      </div>

      {/* Quote */}
      <div className="flex-1 px-5 pb-4">
        <QuoteIcon className="mb-1.5 size-5 text-accent/25" />
        <p className="text-sm leading-relaxed text-text-secondary">{entry.quote}</p>
      </div>

      {/* Thumbnail strip */}
      {images.length > 0 && (
        <div className="border-t border-border px-4 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ scrollbarWidth: "none" }}>
            {images.map((img, idx) => (
              <button
                key={`thumb-${idx}`}
                type="button"
                onClick={() => onImageClick(img)}
                className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-border transition-all hover:ring-accent/50 hover:scale-105"
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="48px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}

function Lightbox({ images, initialIdx, onClose }: { images: string[]; initialIdx: number; onClose: () => void }) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrentIdx((p) => (p > 0 ? p - 1 : images.length - 1));
      if (e.key === "ArrowRight") setCurrentIdx((p) => (p < images.length - 1 ? p + 1 : 0));
    };
    document.addEventListener("keydown", handleKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [onClose, images.length]);

  function handleTouchStart(e: React.TouchEvent) {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;

    if (Math.abs(dy) > 80) {
      onClose();
    } else if (Math.abs(dx) > 50) {
      if (dx > 0) setCurrentIdx((p) => (p > 0 ? p - 1 : images.length - 1));
      else setCurrentIdx((p) => (p < images.length - 1 ? p + 1 : 0));
    }
    setTouchStart(null);
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-10 size-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrentIdx((p) => (p > 0 ? p - 1 : images.length - 1)); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setCurrentIdx((p) => (p < images.length - 1 ? p + 1 : 0)); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 size-10 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      <img
        src={images[currentIdx]}
        alt=""
        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl transition-opacity duration-300"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
          {currentIdx + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
