import Image from "next/image";
import { ShieldIcon, UsersIcon, TrendingUpIcon } from "@/components/icons";

export interface GrowthStat {
  value: number;
  label: string;
  period: string;
}

export interface ManagerProfileProps {
  name: string;
  title: string;
  positionCode?: string;
  positionStartDate?: string;
  bio: string;
  achievements: string[];
  currentAgentCount: number;
  growthStats: GrowthStat[];
  photoUrl?: string;
}

export function ManagerProfile(props: ManagerProfileProps) {
  const agentStat = props.growthStats.find(s => s.label === "نمایندگان" && s.period === "یک سال")
    || props.growthStats.find(s => s.label === "نمایندگان");
  const policyStat = props.growthStats.find(s => s.label === "بیمه‌نامه" && s.period === "یک سال")
    || props.growthStats.find(s => s.label === "بیمه‌نامه");

  const hasAnyStat = agentStat || policyStat;

  return (
    <section
      id="manager-profile"
      aria-labelledby="manager-profile-heading"
      className="relative overflow-hidden bg-gradient-to-b from-brand-emphasis/[0.04] via-brand-emphasis/[0.02] to-transparent px-4 pb-16 pt-12 md:pt-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-accent)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_var(--color-brand-cta)_0%,_transparent_50%)] opacity-[0.03] dark:opacity-[0.06]" />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <div className="mx-auto mb-5 inline-block">
          <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-cta/20 to-brand-cta/5 shadow-lg overflow-hidden ring-4 ring-brand-cta/10 md:size-40">
            {props.photoUrl ? (
              <Image src={props.photoUrl} alt={props.name} width={160} height={160} className="size-full object-cover" />
            ) : props.name ? (
              <span className="text-4xl font-bold text-brand-cta md:text-5xl">
                {props.name.charAt(0)}
              </span>
            ) : (
              <ShieldIcon className="size-12 text-brand-cta/60 md:size-16" />
            )}
          </div>
        </div>

        <h1
          id="manager-profile-heading"
          className="text-2xl font-extrabold text-brand-emphasis md:text-3xl"
        >
          {props.name || "مدیر فروش بیمه عمر"}
          {props.title && (
            <span className="text-lg font-bold text-text-secondary md:text-xl">
              {" ، "}{props.title}
            </span>
          )}
          {props.positionCode && (
            <span className="text-base font-medium text-text-secondary">
              {" کد "}{props.positionCode}
            </span>
          )}
        </h1>

        {props.bio && (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">
            {props.bio}
          </p>
        )}

        {(hasAnyStat || props.currentAgentCount > 0) && (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
            {props.currentAgentCount > 0 && (
              <div className="flex items-center gap-2 rounded-full bg-bg-surface px-4 py-2 shadow-sm ring-1 ring-border/50">
                <UsersIcon className="size-4 text-accent" />
                <span className="font-bold text-text-primary">{props.currentAgentCount}</span>
                <span className="text-text-secondary">نماینده فعال</span>
              </div>
            )}

            {agentStat && (
              <div className="flex items-center gap-1.5 rounded-full bg-bg-surface px-4 py-2 shadow-sm ring-1 ring-border/50">
                <TrendingUpIcon className="size-4 text-green-600 dark:text-green-400" />
                <span className={`font-bold ${agentStat.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {agentStat.value >= 0 ? "+" : ""}{agentStat.value}٪
                </span>
                <span className="text-text-secondary">نمایندگان</span>
              </div>
            )}

            {policyStat && (
              <div className="flex items-center gap-1.5 rounded-full bg-bg-surface px-4 py-2 shadow-sm ring-1 ring-border/50">
                <TrendingUpIcon className="size-4 text-green-600 dark:text-green-400" />
                <span className={`font-bold ${policyStat.value >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                  {policyStat.value >= 0 ? "+" : ""}{policyStat.value}٪
                </span>
                <span className="text-text-secondary">بیمه‌نامه</span>
              </div>
            )}
          </div>
        )}

        {props.achievements.length > 0 && (
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="flex flex-wrap justify-center gap-2">
              {props.achievements.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand-cta/10 px-4 py-2 text-sm text-brand-cta ring-1 ring-brand-cta/20"
                >
                  <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}