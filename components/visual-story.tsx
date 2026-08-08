"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export interface VisualStoryProps {
  images: string[];
}

export function VisualStory({ images }: VisualStoryProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (images.length === 0) return null;

  return (
    <>
      <section
        id="visual-story"
        aria-labelledby="visual-story-heading"
        className="bg-bg-base py-16 md:py-20"
      >
        <div className="mx-auto max-w-5xl px-4">
          <h2
            id="visual-story-heading"
            className="mb-10 text-center text-2xl font-bold text-brand-emphasis md:text-3xl"
          >
            روایت تصویری موفقیت
          </h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIdx(idx)}
                className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-bg-surface shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={idx < 4 ? "eager" : "lazy"}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          initialIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}
    </>
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-sm"
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
        className="max-h-[85vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
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
