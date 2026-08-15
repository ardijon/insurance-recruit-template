"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/lightbox";

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
