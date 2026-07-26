"use client";

import { useState } from "react";
import { PlusIcon, MinusIcon } from "@/components/icons";

export interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export function FaqSection({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (items.length === 0) return null;

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-bg-surface py-16 md:py-20"
    >
      <div className="mx-auto max-w-3xl px-4">
        <h2
          id="faq-heading"
          className="mb-10 text-center text-2xl font-bold text-brand-emphasis md:text-3xl"
        >
          پرسش و پاسخ پیش از مصاحبه
        </h2>

        <div className="divide-y divide-border rounded-xl border border-border bg-bg-base">
          {items.map((item) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right transition-colors hover:bg-bg-surface/50"
                >
                  <span className="text-base font-bold text-brand-emphasis">
                    {item.question}
                  </span>
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-secondary transition-transform duration-300">
                    {isOpen ? <MinusIcon className="size-4" /> : <PlusIcon className="size-4" />}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                  style={{ display: "grid" }}
                >
                  <div className="min-h-0">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
