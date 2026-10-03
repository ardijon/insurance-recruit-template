"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface LightboxProps {
  images: string[];
  initialIdx: number;
  onClose: () => void;
}

export function Lightbox({ images, initialIdx, onClose }: LightboxProps) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [transition, setTransition] = useState<"slide-left" | "slide-right" | null>(null);
  const [dragX, setDragX] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(1);
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const isAnimating = useRef(false);

  const goTo = useCallback((dir: 1 | -1) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setTransition(dir === 1 ? "slide-left" : "slide-right");
    setTimeout(() => {
      setCurrentIdx((p) => {
        if (dir === 1) return p < images.length - 1 ? p + 1 : 0;
        return p > 0 ? p - 1 : images.length - 1;
      });
      setDragX(0);
      setTimeout(() => {
        setTransition(null);
        isAnimating.current = false;
      }, 500);
    }, 30);
  }, [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goTo(1);
      if (e.key === "ArrowRight") goTo(-1);
    };
    document.addEventListener("keydown", handleKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
    };
  }, [onClose, goTo]);

  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimating.current) return;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!touchRef.current || isAnimating.current) return;
    const dx = e.touches[0].clientX - touchRef.current.x;
    const dy = e.touches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) * 1.2) {
      setDragX(dx);
      setBgOpacity(Math.max(0.4, 1 - Math.abs(dx) / 600));
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchRef.current) return;
    const dx = e.changedTouches[0].clientX - touchRef.current.x;
    const dy = e.changedTouches[0].clientY - touchRef.current.y;
    touchRef.current = null;

    if (dy > 100) { onClose(); return; }
    // RTL: swipe right = next, swipe left = previous
    if (dx > 60) goTo(1);
    else if (dx < -60) goTo(-1);
    else { setDragX(0); setBgOpacity(1); }
  }

  const slideStyle = ((): React.CSSProperties => {
    if (dragX !== 0 && transition === null) {
      return {
        transform: `translateX(${dragX * 0.5}px) scale(${1 - Math.abs(dragX) / 2000})`,
        transition: "none",
      };
    }
    if (transition === "slide-left") {
      return {
        transform: "translateX(-120%) scale(0.85)",
        opacity: 0,
        transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
      };
    }
    if (transition === "slide-right") {
      return {
        transform: "translateX(120%) scale(0.85)",
        opacity: 0,
        transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
      };
    }
    return {
      transform: "translateX(0) scale(1)",
      opacity: 1,
      transition: "transform 0.5s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.5s cubic-bezier(0.32, 0.72, 0, 1)",
    };
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        backgroundColor: `rgba(var(--color-bg-base-rgb, 250 248 244), ${bgOpacity})`,
        backdropFilter: `blur(${12 * bgOpacity}px)`,
        transition: "background-color 0.3s, backdrop-filter 0.3s",
      }}
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-20 size-10 flex items-center justify-center rounded-full bg-black/8 text-text-primary hover:bg-black/15 transition-colors"
        aria-label="بستن"
      >
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Arrows — desktop only, RTL */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goTo(-1); }}
            className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 size-11 items-center justify-center rounded-full bg-black/6 text-text-primary/60 hover:bg-black/12 hover:text-text-primary transition-all duration-200"
            aria-label="تصویر قبلی"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goTo(1); }}
            className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 size-11 items-center justify-center rounded-full bg-black/6 text-text-primary/60 hover:bg-black/12 hover:text-text-primary transition-all duration-200"
            aria-label="تصویر بعدی"
          >
            <svg className="size-6 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        </>
      )}

      {/* Neighbor preloads so prev/next images appear instantly */}
      <div aria-hidden="true" className="hidden">
        {images.length > 1 && (
          <>
            <img key={`prev-${currentIdx}`} src={images[(currentIdx - 1 + images.length) % images.length]} alt="" />
            <img key={`next-${currentIdx}`} src={images[(currentIdx + 1) % images.length]} alt="" />
          </>
        )}
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center px-6 overflow-hidden select-none">
        <img
          key={currentIdx}
          src={images[currentIdx]}
          alt=""
          className="max-h-[82vh] max-w-full rounded-2xl object-contain shadow-2xl will-change-transform"
          style={slideStyle}
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </div>

      {/* Counter */}
      {images.length > 1 && (
        <div className="pb-5 pt-2 text-center">
          <span className="inline-block rounded-full bg-black/8 px-5 py-2 text-sm font-medium text-text-primary backdrop-blur-sm tabular-nums">
            {currentIdx + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
}
