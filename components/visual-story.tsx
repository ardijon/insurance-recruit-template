"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
        className="bg-bg-base py-16 md:py-20 overflow-hidden"
      >
        <div className="mx-auto max-w-5xl px-4">
          <h2
            id="visual-story-heading"
            className="mb-12 text-center text-2xl font-bold text-brand-emphasis md:text-3xl"
          >
            روایت تصویری موفقیت
          </h2>

          <CoverFlow images={images} onImageClick={setLightboxIdx} />
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

function CoverFlow({ images, onImageClick }: { images: string[]; onImageClick: (idx: number) => void }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const goNext = useCallback(() => {
    setActiveIdx((p) => (p + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setActiveIdx((p) => (p - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goNext, goPrev]);

  // Touch
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  }

  function getStyle(idx: number): React.CSSProperties {
    const diff = idx - activeIdx;
    const absDiff = Math.abs(diff);

    if (diff === 0) {
      return {
        transform: "translateX(0) translateZ(60px) rotateY(0deg) scale(1)",
        zIndex: 10,
        opacity: 1,
      };
    }

    const direction = diff < 0 ? -1 : 1;
    const offset = Math.min(absDiff, 3);

    return {
      transform: `translateX(${direction * (180 + offset * 20)}px) translateZ(-${offset * 60}px) rotateY(${direction * -55}deg) scale(${1 - offset * 0.08})`,
      zIndex: 10 - offset,
      opacity: Math.max(0.3, 1 - offset * 0.25),
    };
  }

  return (
    <div
      ref={containerRef}
      className="relative h-[300px] sm:h-[380px] md:h-[440px] perspective-[1200px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Reflection gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg-base via-bg-base/80 to-transparent z-20 pointer-events-none" />

      {/* Cards container */}
      <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        {images.map((img, idx) => {
          const style = getStyle(idx);
          const diff = idx - activeIdx;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (diff === 0) onImageClick(idx);
                else setActiveIdx(idx);
              }}
              className="absolute transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer"
              style={style}
            >
              <div className="relative w-[180px] sm:w-[240px] md:w-[300px] aspect-[3/4] rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 240px, 300px"
                  className="object-cover"
                  priority={idx === activeIdx}
                />

                {/* Shine overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 pointer-events-none" />

                {/* Active indicator */}
                {diff === 0 && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-brand-cta" />
                )}
              </div>

              {/* Reflection */}
              <div
                className="relative w-[180px] sm:w-[240px] md:w-[300px] aspect-[3/4] rounded-xl overflow-hidden -mt-[2px] opacity-20 pointer-events-none"
                style={{ transform: "scaleY(-1)", maskImage: "linear-gradient(to bottom, black 0%, transparent 60%)", WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 60%)" }}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 240px, 300px"
                  className="object-cover"
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 size-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40 hover:scale-110"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 size-10 flex items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition-all hover:bg-black/40 hover:scale-110"
          >
            <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}

      {/* Counter */}
      <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3">
        <span className="rounded-full bg-black/30 px-4 py-1.5 text-sm text-white backdrop-blur-md font-medium">
          {activeIdx + 1} / {images.length}
        </span>
      </div>

      {/* Click hint */}
      <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-30">
        <span className="text-[11px] text-text-secondary/60">روی عکس کلیک کنید</span>
      </div>
    </div>
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
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
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