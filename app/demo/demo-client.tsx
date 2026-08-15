"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Profile {
  name: string; title: string; bio: string; achievements: string[];
  currentAgentCount: number; growthAgents: number; growthPolicies: number;
  photoUrl: string;
}
interface SuccessEntry { id: number; agentName: string; quote: string; images_json?: string; }
interface GrowthStage { id: number; title: string; description: string; }
interface FaqItem { id: number; question: string; answer: string; }
interface Applicant { full_name: string; city: string; score: number | null; status: string; created_at: string; }

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  new: { label: "جدید", color: "text-blue-600", bg: "bg-blue-50 ring-blue-200" },
  contacted: { label: "تماس گرفته شده", color: "text-amber-600", bg: "bg-amber-50 ring-amber-200" },
  interviewed: { label: "مصاحبه شده", color: "text-purple-600", bg: "bg-purple-50 ring-purple-200" },
  hired: { label: " استخدام شده", color: "text-green-600", bg: "bg-green-50 ring-green-200" },
  rejected: { label: "رد شده", color: "text-red-500", bg: "bg-red-50 ring-red-200" },
};

const SECTIONS = [
  { id: "hero", label: "معرفی", icon: "🏠" },
  { id: "profile", label: "پروفایل مدیر", icon: "👤" },
  { id: "success", label: "دیوار موفقیت", icon: "🏆" },
  { id: "visual", label: "روایت تصویری", icon: "📸" },
  { id: "growth", label: "مسیر رشد", icon: "📈" },
  { id: "faq", label: "سوالات متداول", icon: "❓" },
  { id: "applicants", label: "مدیریت متقاضیان", icon: "👥" },
  { id: "features", label: "ویژگی‌ها", icon: "⚡" },
];

export function DemoPageClient({ profile, successEntries, visualStoryImages, growthStages, faqItems, applicants }: {
  profile: Profile; successEntries: SuccessEntry[]; visualStoryImages: string[];
  growthStages: GrowthStage[]; faqItems: FaqItem[]; applicants: Applicant[];
}) {
  const [activeSection, setActiveSection] = useState("hero");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openGrowth, setOpenGrowth] = useState<number>(0);

  const stats = [
    { value: profile.currentAgentCount, label: "نماینده فعال", color: "text-brand-cta" },
    { value: `+${profile.growthAgents}%`, label: "رشد نمایندگان", color: "text-green-600" },
    { value: `+${profile.growthPolicies}%`, label: "رشد بیمه‌نامه", color: "text-green-600" },
    { value: applicants.length, label: "متقاضی ثبت‌شده", color: "text-brand-cta" },
  ];

  return (
    <div className="min-h-screen bg-bg-base">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-bg-base/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <span className="text-brand-cta font-black text-lg">demo</span>
            <span className="text-text-secondary text-xs bg-bg-surface px-2 py-0.5 rounded-full">تور تعاملی</span>
          </div>
          <div className="hidden sm:flex gap-1 overflow-x-auto scrollbar-hide">
            {SECTIONS.map((s) => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  activeSection === s.id
                    ? "bg-brand-cta text-white shadow-sm"
                    : "text-text-secondary hover:bg-bg-surface"
                }`}>
                {s.icon} {s.label}
              </button>
            ))}
          </div>
          <a href="/admin" className="text-xs font-medium text-brand-cta hover:underline">ورود مدیریت →</a>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className="sm:hidden sticky top-14 z-40 bg-bg-base/90 backdrop-blur-md border-b border-border px-2 py-2 flex gap-1 overflow-x-auto scrollbar-hide">
        {SECTIONS.map((s) => (
          <button key={s.id} onClick={() => setActiveSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeSection === s.id
                ? "bg-brand-cta text-white"
                : "text-text-secondary bg-bg-surface"
            }`}>
            {s.icon}
          </button>
        ))}
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* ─── HERO SECTION ─── */}
        {activeSection === "hero" && (
          <section className="animate-fade-in">
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-2 bg-brand-cta/10 text-brand-cta px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                تور تعاملی محصول
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-brand-emphasis mb-4">
                سیستم جذب نماینده بیمه
              </h1>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto mb-8">
                تمام قابلیت‌های سیستم را به صورت زنده ببینید. از صفحه اصلی تا پنل مدیریت.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-border shadow-sm">
                    <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                    <div className="text-xs text-text-secondary mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                <button onClick={() => setActiveSection("profile")} className="bg-brand-cta text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-opacity">
                  شروع تور ←
                </button>
                <Link href="/" className="border border-border text-text-primary px-6 py-3 rounded-xl font-medium hover:bg-bg-surface transition-colors">
                  مشاهده سایت اصلی
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ─── PROFILE SECTION ─── */}
        {activeSection === "profile" && (
          <section className="animate-fade-in">
            <SectionHeader title="پروفایل مدیر فروش" subtitle="اطلاعات حرفه‌ای مدیر که برای متقاضیان نمایش داده می‌شود" />
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-cta/20 to-brand-cta/5 flex items-center justify-center ring-4 ring-brand-cta/10">
                  <span className="text-3xl font-bold text-brand-cta">{profile.name.charAt(0)}</span>
                </div>
                <div className="text-center sm:text-right">
                  <h2 className="text-xl font-black text-brand-emphasis">{profile.name}</h2>
                  <p className="text-text-secondary">{profile.title}</p>
                  <p className="text-text-secondary text-sm mt-1">کد MGR-107 · از ۱۴۰۰/۰۶/۰۱</p>
                </div>
              </div>
              <p className="text-text-secondary leading-relaxed mb-6">{profile.bio}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {profile.achievements.map((a, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-brand-cta/10 text-brand-cta px-3 py-1.5 rounded-full text-xs font-medium ring-1 ring-brand-cta/20">
                    ★ {a}
                  </span>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bg-surface rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-brand-cta">{profile.currentAgentCount}</div>
                  <div className="text-xs text-text-secondary">نماینده فعال</div>
                </div>
                <div className="bg-bg-surface rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-green-600">+{profile.growthAgents}%</div>
                  <div className="text-xs text-text-secondary">رشد نمایندگان</div>
                </div>
                <div className="bg-bg-surface rounded-xl p-3 text-center">
                  <div className="text-xl font-black text-green-600">+{profile.growthPolicies}%</div>
                  <div className="text-xs text-text-secondary">رشد بیمه‌نامه</div>
                </div>
              </div>
            </div>
            <NavButtons current="profile" onNav={setActiveSection} />
          </section>
        )}

        {/* ─── SUCCESS WALL ─── */}
        {activeSection === "success" && (
          <section className="animate-fade-in">
            <SectionHeader title="دیوار موفقیت نمایندگان" subtitle="نظرات و تجربیات نمایندگان موفق — قوی‌ترین ابزار جذب متقاضی" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {successEntries.map((entry) => {
                const images = (() => {
                  if (!entry.images_json) return [];
                  try { return JSON.parse(entry.images_json) as string[]; } catch { return []; }
                })();
                return (
                  <div key={entry.id} className="bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-1 bg-accent/30 rounded-r-2xl" />
                    <div className="flex flex-col items-center pt-5 pb-3">
                      <div className="relative mb-3">
                        {images.length > 0 ? (
                          <div className="relative size-16 overflow-hidden rounded-full ring-3 ring-accent/20">
                            <Image
                              src={images[0]}
                              alt={entry.agentName}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 ring-3 ring-accent/20">
                            <span className="text-xl font-bold text-accent">{entry.agentName.charAt(0)}</span>
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
                    <div className="px-5 pb-4">
                      <p className="text-sm text-text-secondary leading-relaxed">{entry.quote}</p>
                    </div>
                    {images.length > 0 && (
                      <div className="border-t border-border px-4 py-3">
                        <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
                          {images.map((img, idx) => (
                            <div key={`thumb-${idx}`} className="relative size-12 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
                              <Image
                                src={img}
                                alt=""
                                fill
                                sizes="48px"
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <NavButtons current="success" onNav={setActiveSection} />
          </section>
        )}

        {/* ─── VISUAL STORY ─── */}
        {activeSection === "visual" && (
          <section className="animate-fade-in">
            <SectionHeader title="روایت تصویری موفقیت" subtitle="گالری تصاویر نمایندگان موفق و لحظات کلیدی تیم" />
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
              {visualStoryImages.map((img, idx) => (
                <div key={idx} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-bg-surface shadow-sm">
                  <Image
                    src={img}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    loading={idx < 4 ? "eager" : "lazy"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              ))}
            </div>
            <NavButtons current="visual" onNav={setActiveSection} />
          </section>
        )}

        {/* ─── GROWTH PATH ─── */}
        {activeSection === "growth" && (
          <section className="animate-fade-in">
            <SectionHeader title="مسیر رشد نماینده" subtitle="نمایش مسیر شغلی واضح برای متقاضیان — از بازاریاب تا مدیر ارشد" />
            <div className="space-y-3">
              {growthStages.map((stage, i) => (
                <div key={stage.id} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm">
                  <button onClick={() => setOpenGrowth(openGrowth === i ? -1 : i)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-right hover:bg-bg-surface/50 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-brand-cta text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] font-semibold text-accent">مرحله {i + 1}</span>
                      <h3 className="text-base font-bold text-brand-emphasis">{stage.title}</h3>
                    </div>
                    <svg className={`w-5 h-5 text-text-secondary transition-transform ${openGrowth === i ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openGrowth === i && (
                    <div className="border-t border-border/50 px-5 py-4 animate-fade-in">
                      <p className="text-sm text-text-secondary leading-relaxed">{stage.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <NavButtons current="growth" onNav={setActiveSection} />
          </section>
        )}

        {/* ─── FAQ ─── */}
        {activeSection === "faq" && (
          <section className="animate-fade-in">
            <SectionHeader title="پرسش و پاسخ" subtitle="پاسخ به سوالات رایج متقاضیان پیش از مصاحبه" />
            <div className="bg-white rounded-2xl border border-border divide-y divide-border overflow-hidden">
              {faqItems.map((item) => (
                <div key={item.id}>
                  <button onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-right hover:bg-bg-surface/50 transition-colors">
                    <span className="text-sm font-bold text-brand-emphasis">{item.question}</span>
                    <span className="shrink-0 w-6 h-6 flex items-center justify-center text-text-secondary">
                      {openFaq === item.id ? "−" : "+"}
                    </span>
                  </button>
                  {openFaq === item.id && (
                    <div className="px-6 pb-5 animate-fade-in">
                      <p className="text-sm text-text-secondary leading-relaxed">{item.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <NavButtons current="faq" onNav={setActiveSection} />
          </section>
        )}

        {/* ─── APPLICANTS ─── */}
        {activeSection === "applicants" && (
          <section className="animate-fade-in">
            <SectionHeader title="پنل مدیریت متقاضیان" subtitle="مشاهده و مدیریت تمام متقاضیان در یک نگاه" />
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 border-b border-border">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-blue-600">{applicants.length}</div>
                  <div className="text-[11px] text-text-secondary">کل متقاضیان</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-green-600">{applicants.filter(a => a.status === "hired").length}</div>
                  <div className="text-[11px] text-text-secondary"> استخدام شده</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-amber-600">{applicants.filter(a => a.status === "interviewed").length}</div>
                  <div className="text-[11px] text-text-secondary">مصاحبه شده</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-purple-600">{applicants.filter(a => a.status === "new").length}</div>
                  <div className="text-[11px] text-text-secondary">جدید</div>
                </div>
              </div>

              {/* Applicant list */}
              <div className="divide-y divide-border/50">
                {applicants.map((a, i) => {
                  const st = STATUS_MAP[a.status] ?? STATUS_MAP.new;
                  const scoreColor = a.score != null
                    ? a.score >= 70 ? "text-green-600 bg-green-50 ring-green-200"
                    : a.score >= 40 ? "text-amber-600 bg-amber-50 ring-amber-200"
                    : "text-text-secondary bg-bg-surface ring-border"
                    : "text-text-secondary bg-bg-surface ring-border";

                  return (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-bg-surface/50 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ring-2 shrink-0 ${scoreColor}`}>
                        <span className="text-xs font-bold">{a.score != null ? a.score : a.full_name.charAt(0)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-text-primary truncate">{a.full_name}</span>
                          {a.city && <span className="text-xs text-text-secondary">· {a.city}</span>}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ${st.bg} ${st.color}`}>
                            {st.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <NavButtons current="applicants" onNav={setActiveSection} />
          </section>
        )}

        {/* ─── FEATURES ─── */}
        {activeSection === "features" && (
          <section className="animate-fade-in">
            <SectionHeader title="ویژگی‌های کلیدی" subtitle="تمام چیزی که برای مدیریت حرفه‌ای نیاز دارید" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { icon: "🌐", title: "سایت اختصاصی", desc: "وب‌سایت حرفه‌ای با پروفایل مدیر، دیوار موفقیت و مسیر رشد" },
                { icon: "📝", title: "فرم هوشمند", desc: "فرم ۳ مرحله‌ای با اعتبارسنجی و ارزیابی تناسب شغلی" },
                { icon: "🎯", title: "امتیازدهی خودکار", desc: "سیستم هوشمند رتبه‌بندی متقاضیان بر اساس معیارهای کلیدی" },
                { icon: "📋", title: "پنل مدیریت", desc: "داشبورد جامع با فیلتر، جستجو و مدیریت وضعیت" },
                { icon: "📅", title: "تقویم شمسی", desc: "تعیین وقت ملاقات با تقویم شمسی یکپارچه" },
                { icon: "🔗", title: "سیستم ارجاع", desc: "لینک اختصاصی هر نماینده برای معرفی دوستان" },
                { icon: "🎨", title: "تم قابل تغییر", desc: "سوئیچ بین تم روشن و تاریک با یک کلیک" },
                { icon: "📱", title: "ریسپانسیو", desc: "بهینه شده برای موبایل، تبلت و دسکتاپ" },
                { icon: "🔒", title: "امنیت", desc: "احراز هویت مدیریت و محافظت از داده‌ها" },
              ].map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-border p-5 hover:shadow-md transition-all hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-xl bg-brand-cta/10 flex items-center justify-center text-xl mb-3">{f.icon}</div>
                  <h3 className="font-bold text-brand-emphasis mb-1">{f.title}</h3>
                  <p className="text-sm text-text-secondary">{f.desc}</p>
                </div>
              ))}
            </div>
            <NavButtons current="features" onNav={setActiveSection} />
          </section>
        )}
      </main>

      {/* Sticky CTA - Buy Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gradient-to-t from-bg-base via-bg-base/95 to-transparent pointer-events-none">
        <div className="max-w-6xl mx-auto pointer-events-auto">
          <a
            href="https://ai2apps.sbs/store/tavana"
            className="flex items-center justify-center gap-3 w-full bg-brand-cta hover:opacity-90 text-white font-bold text-sm sm:text-base py-4 px-6 rounded-2xl shadow-lg shadow-brand-cta/25 transition-all hover:shadow-xl hover:shadow-brand-cta/30 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
            <span>همین قالب رو برای خودت بساز</span>
            <span className="hidden sm:inline text-white/70">|</span>
            <span className="hidden sm:inline text-white/90">۱۴,۹۰۰,۰۰۰ تومان</span>
          </a>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl sm:text-2xl font-black text-brand-emphasis">{title}</h2>
      <p className="text-sm text-text-secondary mt-1">{subtitle}</p>
    </div>
  );
}

function NavButtons({ current, onNav }: { current: string; onNav: (id: string) => void }) {
  const idx = SECTIONS.findIndex((s) => s.id === current);
  const prev = idx > 0 ? SECTIONS[idx - 1] : null;
  const next = idx < SECTIONS.length - 1 ? SECTIONS[idx + 1] : null;

  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-border">
      {prev ? (
        <button onClick={() => onNav(prev.id)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-brand-cta transition-colors">
          <span>{prev.icon}</span> ← {prev.label}
        </button>
      ) : <div />}
      {next ? (
        <button onClick={() => onNav(next.id)} className="flex items-center gap-2 text-sm font-medium text-brand-cta hover:opacity-80 transition-opacity">
          {next.label} ← <span>{next.icon}</span>
        </button>
      ) : <div />}
    </div>
  );
}
