"use client";

import { useState, memo } from "react";
import { BriefcaseIcon, UsersIcon, TrophyIcon, TargetIcon, StarIcon, ChevronIcon } from "@/components/icons";

export interface GrowthPathStage {
  id: number;
  title: string;
  description: string;
}

const STAGE_ICONS = [TargetIcon, UsersIcon, TrophyIcon, BriefcaseIcon];

export function GrowthPath({ stages }: { stages: GrowthPathStage[] }) {
  if (stages.length === 0) return null;

  return (
    <section
      id="growth-path"
      aria-labelledby="growth-path-heading"
      className="py-16 md:py-20"
    >
      <div className="mx-auto max-w-3xl px-4">
        <h2
          id="growth-path-heading"
          className="mb-12 text-center text-2xl font-bold text-brand-emphasis md:text-3xl"
        >
          مسیر رشد نماینده
        </h2>

        <div className="flex flex-col gap-3">
          {stages.map((stage, i) => {
            const IconComponent = STAGE_ICONS[i] ?? StarIcon;
            return (
              <AccordionItem
                key={stage.id}
                stage={stage}
                index={i}
                IconComponent={IconComponent}
                defaultOpen={i === 0}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

const AccordionItem = memo(function AccordionItem({
  stage,
  index,
  IconComponent,
  defaultOpen,
}: {
  stage: GrowthPathStage;
  index: number;
  IconComponent: React.ComponentType<{ className?: string }>;
  defaultOpen: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="group rounded-2xl border border-border bg-bg-base shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-4 px-5 py-4 text-right transition-colors hover:bg-bg-surface/50"
      >
        {/* Icon */}
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-cta text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
          <IconComponent className="size-5" />
        </div>

        {/* Step number + title */}
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-accent">
            مرحله {index + 1}
          </span>
          <h3 className="text-base font-bold text-brand-emphasis leading-snug">
            {stage.title}
          </h3>
        </div>

        {/* Chevron */}
        <ChevronIcon
          className={`size-5 shrink-0 text-text-secondary transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-300 ease-out"
        style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      >
        <div className="min-h-0">
          <div className="border-t border-border/50 px-5 py-4">
            <p className="text-sm leading-relaxed text-text-secondary">
              {stage.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
