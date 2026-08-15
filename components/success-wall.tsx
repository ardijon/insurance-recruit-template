"use client";

import { useState } from "react";
import Image from "next/image";
import { QuoteIcon } from "@/components/icons";
import { Lightbox } from "@/components/lightbox";

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
            {entries.map((entry) => {
              const images = (() => {
                if (!entry.images_json) return [];
                try { return JSON.parse(entry.images_json) as string[]; } catch { return []; }
              })();
              return (
                <SuccessCard key={entry.id} entry={entry} images={images} onImageClick={(img) => {
                  const idx = images.indexOf(img);
                  setLightboxIdx({ images, idx: idx >= 0 ? idx : 0 });
                }} />
              );
            })}
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

function SuccessCard({ entry, images, onImageClick }: { entry: SuccessWallEntry; images: string[]; onImageClick: (src: string) => void }) {
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

