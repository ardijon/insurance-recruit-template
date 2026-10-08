"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

export interface LightboxProps {
  images: string[];
  initialIdx: number;
  onClose: () => void;
  imageAlts?: string[];
}

export function Lightbox({ images, initialIdx, onClose, imageAlts }: LightboxProps) {
  const [currentIdx, setCurrentIdx] = useState(initialIdx);
  const [transition, setTransition] = useState<"slide-left" | "slide-right" | null>(null);
  const [dragX, setDragX] = useState(0);
  const [bgOpacity, setBgOpacity] = useState(1);
  const [zoomed, setZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState("50% 50%");
  const touchRef = useRef<{ x: number; y: number } | null>(null);
  const isAnimating = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);
  const lastTapRef = useRef(0);

  function toggleZoom(origin?: string) {
    if (origin) setZoomOrigin(origin);
    setZoomed((z) => !z);
  }

  function zoomOriginFromEvent(clientX: number, clientY: number, target: EventTarget | null) {
    const el = (target as HTMLElement | null)?.closest?.("img") as HTMLElement | null;
    if (!el) return "50% 50%";
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return "50% 50%";
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return `${Math.min(100, Math.max(0, x))}% ${Math.min(100, Math.max(0, y))}%`;
  }

  const goTo = useCallback((dir: 1 | -1) => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    setZoomed(false);
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
    openerRef.current = document.activeElement;
    closeBtnRef.current?.focus();
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key === "ArrowLeft") goTo(1);
      if (e.key === "ArrowRight") goTo(-1);
      // Focus trap: keep Tab cycling inside the dialog while open
      if (e.key === "Tab") {
        const root = containerRef.current;
        if (!root) return;
        const focusables = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    document.body.classList.add("overflow-hidden");
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.classList.remove("overflow-hidden");
      // Return focus to the thumbnail that opened the lightbox
      (openerRef.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose, goTo]);

  function handleTouchStart(e: React.TouchEvent) {
    if (isAnimating.current) return;
    touchRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function handleTouchMove(e: React.TouchEvent) {
    // While zoomed, let the browser pan the scrollable wrapper natively
    if (zoomed || !touchRef.current || isAnimating.current) return;
    const dx = e.touches[0].clientX - touchRef.current.x;
    const dy = e.touches[0].clientY - touchRef.current.y;
    if (Math.abs(dx) > Math.abs(dy) * 1.2) {
      setDragX(dx);
      setBgOpacity(Math.max(0.4, 1 - Math.abs(dx) / 600));
    }
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchRef.current;
    touchRef.current = null;
    if (!start) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;

    // Double-tap on the image toggles zoom (ignore taps on buttons)
    if (Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const onImage = !!(e.target as HTMLElement | null)?.closest?.("img");
      const now = Date.now();
      if (onImage && now - lastTapRef.current < 320) {
        lastTapRef.current = 0;
        toggleZoom(zoomOriginFromEvent(t.clientX, t.clientY, e.target));
        return;
      }
      lastTapRef.current = onImage ? now : 0;
      setDragX(0); setBgOpacity(1);
      return;
    }
    lastTapRef.current = 0;
    if (zoomed) return;

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

  const currentAlt = imageAlts?.[currentIdx] ?? "";

  // Render via portal on document.body: any transformed ancestor (e.g. the
  // AnimateOnShow reveal wrapper) would otherwise turn position:fixed into
  // positioning relative to that ancestor instead of the viewport.
  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={containerRef}
      role="dialog"
      aria-modal="true"
      aria-label="نمایش تصویر روایت موفقیت"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        backgroundColor: `rgba(10, 15, 25, ${0.88 * bgOpacity})`,
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
        ref={closeBtnRef}
        type="button"
        onClick={onClose}
        className="absolute top-4 left-4 z-20 size-11 flex items-center justify-center rounded-full bg-black/8 text-text-primary hover:bg-black/15 transition-colors"
        aria-label="بستن"
      >
        <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleZoom(); }}
          className="size-11 flex items-center justify-center rounded-full bg-black/8 text-text-primary hover:bg-black/15 transition-colors"
          aria-label={zoomed ? "کوچک‌نمایی" : "بزرگ‌نمایی"}
          aria-pressed={zoomed}
        >
          {zoomed ? (
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          ) : (
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.5" y2="16.5" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          )}
        </button>
      </div>

      {/* Arrows — visible on mobile (edge, semi-transparent) and desktop, RTL */}
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goTo(-1); }}
            className="flex absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-20 min-h-11 min-w-11 size-11 items-center justify-center rounded-full bg-black/25 md:bg-black/6 text-white md:text-text-primary/60 hover:bg-black/40 md:hover:bg-black/12 md:hover:text-text-primary transition-all duration-200"
            aria-label="تصویر قبلی"
          >
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); goTo(1); }}
            className="flex absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-20 min-h-11 min-w-11 size-11 items-center justify-center rounded-full bg-black/25 md:bg-black/6 text-white md:text-text-primary/60 hover:bg-black/40 md:hover:bg-black/12 md:hover:text-text-primary transition-all duration-200"
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

      {/* Image — single click zooms out, double-click zooms in; m-auto keeps it
          truly centered and scrollable when zoomed (flex centering alone clips
          the top of overflowing content) */}
      <div className={`flex min-h-0 w-full flex-1 select-none ${zoomed ? "overflow-auto p-6" : "items-center justify-center overflow-hidden px-6"}`}>
        <img
          key={currentIdx}
          src={images[currentIdx]}
          alt={currentAlt}
          className={`max-h-[82vh] max-w-[92vw] rounded-2xl object-contain shadow-2xl will-change-transform ${zoomed ? "m-auto cursor-zoom-out scale-[2]" : "cursor-zoom-in"}`}
          style={zoomed
            ? { transformOrigin: zoomOrigin, transition: "transform 0.2s ease-out, scale 0.2s ease-out" }
            : slideStyle}
          onClick={(e) => { e.stopPropagation(); if (zoomed) toggleZoom(); }}
          onDoubleClick={(e) => { e.stopPropagation(); if (!zoomed) toggleZoom(zoomOriginFromEvent(e.clientX, e.clientY, e.target)); }}
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
    </div>,
    document.body
  );
}
