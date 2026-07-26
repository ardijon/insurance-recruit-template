import { BriefcaseIcon, UsersIcon, TrophyIcon, TargetIcon } from "@/components/icons";

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
      <div className="mx-auto max-w-6xl px-4">
        <h2
          id="growth-path-heading"
          className="mb-12 text-center text-2xl font-bold text-brand-emphasis md:text-3xl"
        >
          مسیر رشد نماینده
        </h2>

        {/* Desktop: horizontal dashboard */}
        <div className="hidden md:block rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
          <div className="flex items-stretch justify-center">
            {stages.map((stage, i) => {
              const IconComponent = STAGE_ICONS[i] ?? StarIcon;
              const isLast = i === stages.length - 1;
              return (
                <div key={stage.id} className="flex items-stretch flex-1 max-w-[280px]">
                  <div className="group flex flex-col flex-1 mx-2 rounded-xl border border-border/60 bg-bg-base shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                    <div className="flex items-center gap-3 border-b border-border/30 px-4 py-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-cta text-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <IconComponent className="size-5" />
                      </div>
                      <span className="flex size-7 items-center justify-center rounded-full bg-accent/15 text-xs font-bold text-accent">
                        {i + 1}
                      </span>
                    </div>
                    <div className="flex flex-col flex-1 gap-1.5 px-4 py-3">
                      <h3 className="text-base font-bold text-brand-emphasis leading-snug">
                        {stage.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-text-secondary">
                        {stage.description}
                      </p>
                    </div>
                  </div>
                  {!isLast && (
                    <div className="flex items-center self-center">
                      <div className="h-0.5 w-10 rounded-full bg-accent/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="md:hidden relative">
          <div className="absolute right-[26px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-brand-cta/40 via-accent/40 to-brand-cta/40" />
          <div className="flex flex-col gap-6">
            {stages.map((stage, i) => {
              const IconComponent = STAGE_ICONS[i] ?? StarIcon;
              return (
                <div key={stage.id} className="relative flex items-start gap-4">
                  <div className="relative z-10 flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-cta text-white shadow-md">
                    <IconComponent className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1 rounded-xl border border-border bg-bg-surface p-4 shadow-sm">
                    <span className="mb-1 inline-block text-xs font-semibold text-accent">
                      مرحله {i + 1}
                    </span>
                    <h3 className="text-base font-bold text-brand-emphasis">{stage.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-text-secondary">{stage.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}