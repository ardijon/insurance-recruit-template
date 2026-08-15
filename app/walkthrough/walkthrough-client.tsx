"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

/* ─── Types ─── */
interface Profile {
  name: string; title: string; positionCode: string; positionStartDate: string;
  bio: string; achievements: string[]; currentAgentCount: number;
  growthAgents6m: number | null; growthAgents1y: number | null; growthAgents2y: number | null;
  growthPolicies6m: number | null; growthPolicies1y: number | null; growthPolicies2y: number | null;
  photoUrl: string;
}
interface SuccessEntry { id: number; agentName: string; quote: string; images_json: string; }
interface GrowthStage { id: number; title: string; description: string; }
interface FaqItem { id: number; question: string; answer: string; }

/* ─── Section info data ─── */
const SECTION_INFO: Record<string, {
  title: string; subtitle: string; icon: string;
  features: string[]; benefits: string[];
  stat?: string; statLabel?: string;
}> = {
  header: {
    title: "هدر سایت", subtitle: "نوار بالای سایت با منوی ناوبری", icon: "🧭",
    features: ["دکمه درخواست نمایندگی در دسترس", "لینک سریع به بخش‌های مختلف", "منوی ریسپانسیو موبایل", "تغییر تم روشن/تاریک", "ورود مدیریت"],
    benefits: ["تجربه کاربری روان برای متقاضی", "دسترسی سریع به فرم درخواست", "سازگار با تمام دستگاه‌ها"],
    stat: "۳ ثانیه", statLabel: "زمان دسترسی به فرم",
  },
  profile: {
    title: "پروفایل مدیر فروش", subtitle: "معرفی حرفه‌ای مدیر به متقاضیان", icon: "👤",
    features: ["عکس پروفایل حرفه‌ای", "بیوگرافی و سمت مدیریتی", "دستاوردها و تندیس‌ها", "آمار رشد نمایندگان و بیمه‌نامه‌ها", "تعداد نمایندگان فعال"],
    benefits: ["ایجاد اعتماد اولیه در متقاضی", "نمایش تخصص و تجربه مدیر", "اثبات اجتماعی با آمار واقعی", "انگیزه‌بخشی به متقاضیان جدید"],
    stat: "+۳۲۰٪", statLabel: "افزایش اعتماد متقاضی",
  },
  success: {
    title: "دیوار موفقیت", subtitle: "نظرات و تجربیات نمایندگان موفق", icon: "🏆",
    features: ["نظرات واقعی نمایندگان", "آواتار و نام هر نماینده", "امکان آپلود تصویر", "کنترل دسترسی (رضایت نماینده)", "مرتب‌سازی دلخواه"],
    benefits: ["قوی‌ترین ابزار جذب متقاضی", "اثبات اجتماعی (Social Proof)", "ایجاد حس اعتماد و اطمینان", "الگوبرداری از موفقیت دیگران"],
    stat: "۸۵٪", statLabel: "تأثیر بر تصمیم متقاضی",
  },
  visual: {
    title: "روایت تصویری", subtitle: "گالری تصاویر موفقیت تیم", icon: "📸",
    features: ["گالری تصاویر تعاملی", "نمایش تمام‌صفحه (Lightbox)", "بارگذاری تنبل تصاویر", "سازگار با موبایل"],
    benefits: ["نمایش بصری موفقیت‌ها", "جذابیت بیشتر صفحه", "افزایش زمان ماندن کاربر"],
  },
  growth: {
    title: "مسیر رشد نماینده", subtitle: "نقشه راه شغلی از بازاریاب تا مدیر ارشد", icon: "📈",
    features: ["۶ مرحله رشد شغلی", "توضیحات هر مرحله", "آکاردئون تعاملی", "آیکون اختصاصی هر مرحله", "طراحی خط زمانی"],
    benefits: ["شفافیت مسیر شغلی", "ایجاد انگیزه برای پیشرفت", "نمایش فرصت‌های واقعی", "کاهش تردید متقاضی"],
    stat: "۶ مرحله", statLabel: "از ورود تا مدیریت",
  },
  faq: {
    title: "پرسش و پاسخ", subtitle: "پاسخ به سوالات رایج متقاضیان", icon: "❓",
    features: ["سوالات رایج متقاضیان", "پاسخ‌های جامع و کامل", "آکاردئون تعاملی", "مرتب‌سازی بر اساس اولویت"],
    benefits: ["حذف تردیدهای متقاضی", "کاهش تماس‌های تکراری", "پاسخگویی ۲۴ ساعته", "بهبود تجربه کاربری"],
    stat: "۷۰٪", statLabel: "کاهش سوالات تکراری",
  },
  footer: {
    title: "فوتر سایت", subtitle: "اطلاعات تماس و لینک‌های مهم", icon: "📍",
    features: ["لینک شبکه‌های اجتماعی", "اطلاعات تماس", "لینک سریع به بخش‌ها", "طراحی ساده و تمیز"],
    benefits: ["دسترسی آسان به اطلاعات تماس", "ارتباط از طریق شبکه‌های اجتماعی"],
  },
  apply: {
    title: "فرم درخواست نمایندگی", subtitle: "فرم هوشمند ۳ مرحله‌ای جذب متقاضی", icon: "📝",
    features: ["۳ مرحله ساده (اطلاعات، سابقه، انگیزه)", "اعتبارسنجی خودکار شماره و نام", "ارزیابی تناسب شغلی اختیاری", "پیشرفت بصری مرحله‌ها", "ذخیره خودکار اطلاعات", "پیام موفقیت پس از ثبت"],
    benefits: ["تجربه ساده و سریع برای متقاضی", "کاهش ریزش متقاضیان", "جمع‌آوری اطلاعات استاندارد", "ارزیابی هوشمند تناسب شغلی", "بدون نیاز به ثبت‌نام"],
    stat: "۳ مرحله", statLabel: "تکمیل در کمتر از ۳ دقیقه",
  },
};

/* ─── Main Component ─── */
export function WalkthroughClient({
  profile, successEntries, growthStages, faqItems,
}: {
  profile: Profile; successEntries: SuccessEntry[];
  growthStages: GrowthStage[]; faqItems: FaqItem[];
}) {
  const [activePopup, setActivePopup] = useState<string | null>(null);
  const demoMode = true;
  const [showWelcome, setShowWelcome] = useState(true);
  const [completedSections, setCompleted] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  const closeWelcome = useCallback(() => setShowWelcome(false), []);

  const openPopup = useCallback((id: string) => {
    setActivePopup(id);
    setCompleted(prev => new Set(prev).add(id));
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(`walkthrough-${id}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    setActivePopup(null);
  }, []);

  const allSections = ["header", "profile", "success", "growth", "faq", "footer"];
  const progress = allSections.length > 0 ? (completedSections.size / allSections.length) * 100 : 0;

  // Close popup on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setActivePopup(null); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div ref={scrollRef} className="min-h-screen bg-bg-base relative">
      {/* ═══ WELCOME MODAL ═══ */}
      {showWelcome && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-bg-base rounded-3xl shadow-2xl max-w-lg w-full p-8 text-center animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-brand-cta to-accent flex items-center justify-center">
              <span className="text-4xl">🎯</span>
            </div>
            <h1 className="text-2xl font-black text-brand-emphasis mb-3">شبیه‌سازی تعاملی سایت</h1>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              این یک نمایش <strong>۱۰۰٪ واقعی</strong> از سایت جذب نماینده بیمه است.
              می‌توانید تمام بخش‌ها را بررسی کنید و روی آیکون <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-cta text-white text-[10px] font-bold align-middle mx-0.5">?</span>
                  هر بخش کلیک کنید تا ویژگی‌ها و مزایای آن را ببینید.
            </p>
            <div className="flex flex-col gap-2 text-right text-sm text-text-secondary mb-6">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-brand-cta text-white text-[10px] flex items-center justify-center font-bold shrink-0">?</span>
                پاپ‌آپ توضیحی هر بخش
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold shrink-0">↑↓</span>
                پیمایش بین بخش‌ها
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-success text-white text-[10px] flex items-center justify-center font-bold shrink-0">✓</span>
                نوار پیشرفت بازدید
              </div>
            </div>
            <button onClick={closeWelcome}
              className="w-full bg-brand-cta text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
              شروع بازدید ←
            </button>
          </div>
        </div>
      )}

      {/* ═══ FLOATING DEMO TOOLBAR ═══ */}
      {demoMode && !showWelcome && (
        <div className="fixed top-0 left-0 right-0 z-[150] bg-brand-emphasis text-white shadow-lg">
          <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-12">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">دمو</span>
              <span className="text-xs opacity-80 hidden sm:inline">شبیه‌سازی تعاملی سایت جذب نماینده بیمه</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Progress */}
              <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <span className="text-[10px] opacity-70">{completedSections.size}/{allSections.length}</span>
              </div>
              {/* Section nav */}
              <div className="hidden sm:flex gap-1">
                {allSections.map(s => (
                  <button key={s} onClick={() => scrollToSection(s)}
                    className={`px-2 py-1 rounded text-[10px] transition-colors ${
                      completedSections.has(s) ? "bg-success/30 text-green-200" : "bg-white/10 hover:bg-white/20"
                    }`}>
                    {SECTION_INFO[s].icon}
                  </button>
                ))}
              </div>
              <Link href="/" className="text-[10px] bg-accent px-3 py-1 rounded-lg font-bold hover:opacity-90">
                مشاهده سایت اصلی
              </Link>
            </div>
          </div>
          {/* Progress bar */}
          <div className="h-0.5 bg-white/10">
            <div className="h-full bg-accent transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* ═══ SITE CONTENT ═══ */}
      <div className={demoMode && !showWelcome ? "pt-14" : ""}>

        {/* ─── HEADER ─── */}
        <div id="walkthrough-header" className="relative">
          <DemoInfoButton sectionId="header" onClick={openPopup} active={activePopup === "header"} />
          <header className="sticky top-0 z-50 border-b border-border bg-bg-base/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <a href="/apply" className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90">
                درخواست نمایندگی
              </a>
              <ul className="hidden items-center gap-6 md:flex">
                <li><a href="#walkthrough-profile" className="text-sm text-text-secondary no-underline hover:text-text-primary">پروفایل مدیر</a></li>
                <li><a href="#walkthrough-success-wall" className="text-sm text-text-secondary no-underline hover:text-text-primary">موفقیت‌ها</a></li>
                <li><a href="#walkthrough-growth" className="text-sm text-text-secondary no-underline hover:text-text-primary">مسیر رشد</a></li>
                <li><a href="#walkthrough-faq" className="text-sm text-text-secondary no-underline hover:text-text-primary">پرسش‌های متداول</a></li>
              </ul>
              <div className="flex items-center gap-2">
                <a href="/admin/login" className="flex size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-colors" title="ورود مدیر">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </a>
              </div>
            </nav>
          </header>
        </div>

        {/* ─── MANAGER PROFILE ─── */}
        <div id="walkthrough-profile" className="relative">
          <DemoInfoButton sectionId="profile" onClick={openPopup} active={activePopup === "profile"} />
          <section className="relative overflow-hidden bg-gradient-to-b from-brand-emphasis/[0.04] via-brand-emphasis/[0.02] to-transparent px-4 pb-16 pt-12 md:pt-20">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-accent)_0%,_transparent_50%),radial-gradient(ellipse_at_bottom_left,_var(--color-brand-cta)_0%,_transparent_50%)] opacity-[0.03] dark:opacity-[0.06]" />
            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <div className="mx-auto mb-5 inline-block">
                <div className="mx-auto flex size-32 items-center justify-center rounded-full bg-gradient-to-br from-brand-cta/20 to-brand-cta/5 shadow-lg overflow-hidden ring-4 ring-brand-cta/10 md:size-40">
                  {profile.photoUrl ? (
                    <Image src={profile.photoUrl} alt={profile.name} width={160} height={160} className="size-full object-cover" />
                  ) : profile.name ? (
                    <span className="text-4xl font-bold text-brand-cta md:text-5xl">{profile.name.charAt(0)}</span>
                  ) : (
                    <svg className="size-12 text-brand-cta/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  )}
                </div>
              </div>
              <h1 className="text-2xl font-extrabold text-brand-emphasis md:text-3xl">
                {profile.name || "مدیر فروش بیمه عمر"}
                {profile.title && <span className="text-lg font-bold text-text-secondary md:text-xl">{" ، "}{profile.title}</span>}
                {profile.positionCode && <span className="text-base font-medium text-text-secondary">{" کد "}{profile.positionCode}</span>}
              </h1>
              {profile.bio && <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-text-secondary">{profile.bio}</p>}

              {(profile.currentAgentCount > 0 || profile.growthAgents1y != null) && (
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-sm">
                  {profile.currentAgentCount > 0 && (
                    <div className="flex items-center gap-2 rounded-full bg-bg-surface px-4 py-2 shadow-sm ring-1 ring-border/50">
                      <svg className="size-4 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                      </svg>
                      <span className="font-bold text-text-primary">{profile.currentAgentCount}</span>
                      <span className="text-text-secondary">نماینده فعال</span>
                    </div>
                  )}
                  {profile.growthAgents1y != null && (
                    <div className="flex items-center gap-1.5 rounded-full bg-bg-surface px-4 py-2 shadow-sm ring-1 ring-border/50">
                      <svg className="size-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20V10M18 20V4M6 20v-4" />
                      </svg>
                      <span className={`font-bold ${profile.growthAgents1y >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {profile.growthAgents1y >= 0 ? "+" : ""}{profile.growthAgents1y}٪
                      </span>
                      <span className="text-text-secondary">نمایندگان</span>
                    </div>
                  )}
                  {profile.growthPolicies1y != null && (
                    <div className="flex items-center gap-1.5 rounded-full bg-bg-surface px-4 py-2 shadow-sm ring-1 ring-border/50">
                      <svg className="size-4 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20V10M18 20V4M6 20v-4" />
                      </svg>
                      <span className={`font-bold ${profile.growthPolicies1y >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {profile.growthPolicies1y >= 0 ? "+" : ""}{profile.growthPolicies1y}٪
                      </span>
                      <span className="text-text-secondary">بیمه‌نامه</span>
                    </div>
                  )}
                </div>
              )}

              {profile.achievements.length > 0 && (
                <div className="mx-auto mt-8 max-w-2xl">
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.achievements.map((item, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1.5 rounded-full bg-brand-cta/10 px-4 py-2 text-sm text-brand-cta ring-1 ring-brand-cta/20">
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
        </div>

        {/* ─── SUCCESS WALL ─── */}
        <div id="walkthrough-success-wall" className="relative">
          <DemoInfoButton sectionId="success" onClick={openPopup} active={activePopup === "success"} />
          <section className="bg-bg-surface py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-4">
              <h2 className="mb-10 text-center text-2xl font-bold text-brand-emphasis md:text-3xl">دیوار موفقیت تیم</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {successEntries.map((entry) => {
                  let images: string[] = [];
                  try { images = JSON.parse(entry.images_json); } catch { /* empty */ }
                  return (
                    <article key={entry.id} className="group relative flex flex-col rounded-2xl border border-border bg-bg-base shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg overflow-hidden">
                      <div className="absolute right-0 top-0 h-full w-1 rounded-r-2xl bg-accent/30 transition-colors group-hover:bg-accent/60" />
                      <div className="flex flex-col items-center pt-6 pb-3">
                        <div className="relative mb-3">
                          {images.length > 0 ? (
                            <div className="relative size-16 overflow-hidden rounded-full ring-3 ring-accent/20">
                              <Image src={images[0]} alt={entry.agentName} fill sizes="64px" className="object-cover" />
                            </div>
                          ) : (
                            <div className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-accent/20 to-accent/5 ring-3 ring-accent/20">
                              <span className="text-xl font-bold text-accent">{entry.agentName.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-sm font-bold text-text-primary">{entry.agentName}</span>
                      </div>
                      <div className="flex-1 px-5 pb-4">
                        <svg className="mb-1.5 size-5 text-accent/25" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                        </svg>
                        <p className="text-sm leading-relaxed text-text-secondary">{entry.quote}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        {/* ─── GROWTH PATH ─── */}
        <div id="walkthrough-growth" className="relative">
          <DemoInfoButton sectionId="growth" onClick={openPopup} active={activePopup === "growth"} />
          <GrowthPathSection stages={growthStages} />
        </div>

        {/* ─── FAQ ─── */}
        <div id="walkthrough-faq" className="relative">
          <DemoInfoButton sectionId="faq" onClick={openPopup} active={activePopup === "faq"} />
          <FaqSection items={faqItems} />
        </div>

        {/* ─── FOOTER ─── */}
        <div id="walkthrough-footer" className="relative">
          <DemoInfoButton sectionId="footer" onClick={openPopup} active={activePopup === "footer"} />
          <footer className="border-t border-border bg-bg-surface py-8">
            <div className="mx-auto max-w-6xl px-4 text-center">
              <p className="text-sm text-text-secondary">طراحی شده برای مدیران فروش حرفه‌ای بیمه</p>
            </div>
          </footer>
        </div>
      </div>

      {/* ─── APPLY PAGE PREVIEW ─── */}
      <div className="bg-bg-base border-t-2 border-dashed border-brand-cta/30 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative">
            <DemoInfoButton sectionId="apply" onClick={openPopup} active={activePopup === "apply"} position="center" />
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-brand-emphasis mb-2">پیش‌نمایش: فرم درخواست نمایندگی</h2>
              <p className="text-text-secondary text-sm">آدرس: /apply</p>
            </div>
            <div className="max-w-lg mx-auto bg-bg-base rounded-2xl border border-border p-6 shadow-lg">
              {/* Mock form */}
              <h3 className="text-xl font-bold text-brand-emphasis mb-6 text-center">فرم درخواست نمایندگی</h3>
              <div className="flex items-center gap-2 mb-6" dir="ltr">
                {[1,2,3].map(n => (
                  <div key={n} className="flex items-center flex-1 last:flex-none">
                    <div className={`size-8 rounded-full flex items-center justify-center text-sm font-bold ${n <= 1 ? "bg-brand-cta text-white" : "bg-border text-text-secondary"}`}>{n}</div>
                    {n < 3 && <div className={`h-1 flex-1 mx-1 rounded ${n < 1 ? "bg-brand-cta" : "bg-border"}`} />}
                  </div>
                ))}
              </div>
              <p className="text-sm text-text-secondary mb-4 text-center">مرحله ۱ از ۳: اطلاعات پایه</p>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                  <div className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-text-secondary text-sm">مثال: علی محمدی</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">شماره تماس <span className="text-red-500">*</span></label>
                  <div className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-text-secondary text-sm">مثال: 09123456789</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">شهر</label>
                  <div className="w-full rounded-lg border border-border bg-bg-base px-3 py-2 text-text-secondary text-sm">مثال: تهران</div>
                </div>
              </div>
              <div className="flex justify-between mt-6">
                <button disabled className="px-6 py-2 rounded-lg border border-border text-text-secondary opacity-40 text-sm">قبلی</button>
                <button className="px-6 py-2 rounded-lg bg-brand-cta text-white text-sm font-medium">بعدی</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADMIN PANEL PREVIEW ─── */}
      <div className="bg-bg-surface border-t-2 border-dashed border-accent/30 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-brand-emphasis mb-2">پیش‌نمایش: پنل مدیریت</h2>
            <p className="text-text-secondary text-sm">آدرس: /admin — رمز: admin123</p>
          </div>
          {/* Mock admin dashboard */}
          <div className="bg-bg-base rounded-2xl border border-border shadow-lg overflow-hidden">
            <div className="bg-brand-emphasis text-white px-4 py-3 flex items-center justify-between">
              <span className="text-sm font-bold">داشبورد مدیریت</span>
              <span className="text-xs opacity-60">admin@site.com</span>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="bg-blue-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-blue-600">۱۸</div>
                  <div className="text-[10px] text-text-secondary">متقاضی</div>
                </div>
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-green-600">۳</div>
                  <div className="text-[10px] text-text-secondary">قرار امروز</div>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-amber-600">۶۳</div>
                  <div className="text-[10px] text-text-secondary">نماینده فعال</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-purple-600">+۷۵٪</div>
                  <div className="text-[10px] text-text-secondary">رشد</div>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {[
                  { name: "پیمان سوری", score: 95, status: "مصاحبه", statusColor: "bg-purple-100 text-purple-700", city: "قم" },
                  { name: "امیر سلطانی", score: 92, status: " استخدام", statusColor: "bg-green-100 text-green-700", city: "شیراز" },
                  { name: "امیررضا نوری", score: 88, status: " استخدام", statusColor: "bg-green-100 text-green-700", city: "تهران" },
                  { name: "وحید کرمی", score: 82, status: " استخدام", statusColor: "bg-green-100 text-green-700", city: "همدان" },
                  { name: "عباس مهدوی", score: 80, status: "جدید", statusColor: "bg-blue-100 text-blue-700", city: "قم" },
                  { name: "زهرا کاظمی", score: 78, status: "مصاحبه", statusColor: "bg-purple-100 text-purple-700", city: "مشهد" },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 hover:bg-bg-surface/50 transition-colors">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ring-2 shrink-0 ${
                      a.score >= 70 ? "text-green-600 bg-green-50 ring-green-200" : "text-amber-600 bg-amber-50 ring-amber-200"
                    }`}>
                      <span className="text-xs font-bold">{a.score}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-text-primary">{a.name}</span>
                        <span className="text-xs text-text-secondary">· {a.city}</span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.statusColor}`}>{a.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ POPUP OVERLAY ═══ */}
      {activePopup && SECTION_INFO[activePopup] && (
        <PopupOverlay
          info={SECTION_INFO[activePopup]}
          sectionId={activePopup}
          onClose={() => setActivePopup(null)}
          onScroll={scrollToSection}
          allSections={allSections}
        />
      )}
    </div>
  );
}

/* ─── Demo Info Button ─── */
function DemoInfoButton({ sectionId, onClick, active, position = "top-left" }: {
  sectionId: string; onClick: (id: string) => void; active: boolean;
  position?: "top-left" | "center";
}) {
  return (
    <button
      onClick={() => onClick(sectionId)}
      className={`fixed z-[100] w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transition-all duration-300 hover:scale-110 ${
        position === "center"
          ? "top-4 left-1/2 -translate-x-1/2"
          : "top-20 left-4"
      } ${active ? "bg-accent ring-2 ring-accent/30 animate-pulse-ring" : "bg-brand-cta hover:bg-brand-cta/90"}`}
      title={`ویژگی‌ها و مزایای ${SECTION_INFO[sectionId]?.title}`}
    >
      ?
    </button>
  );
}

/* ─── Popup Overlay ─── */
function PopupOverlay({ info, sectionId, onClose, onScroll, allSections }: {
  info: typeof SECTION_INFO[string]; sectionId: string;
  onClose: () => void; onScroll: (id: string) => void;
  allSections: string[];
}) {
  const currentIdx = allSections.indexOf(sectionId);
  const prevSection = currentIdx > 0 ? allSections[currentIdx - 1] : null;
  const nextSection = currentIdx < allSections.length - 1 ? allSections[currentIdx + 1] : null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-bg-base rounded-3xl shadow-2xl max-w-md w-full animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-l from-brand-emphasis to-brand-cta rounded-t-3xl px-6 py-5 text-white relative">
          <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{info.icon}</span>
            <div>
              <h3 className="font-black text-lg">{info.title}</h3>
              <p className="text-white/70 text-xs">{info.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {/* Stat badge */}
          {info.stat && (
            <div className="flex items-center justify-center gap-3 mb-5 py-3 bg-brand-cta/5 rounded-xl">
              <span className="text-2xl font-black text-brand-cta">{info.stat}</span>
              <span className="text-xs text-text-secondary">{info.statLabel}</span>
            </div>
          )}

          {/* Features */}
          <div className="mb-5">
            <h4 className="text-xs font-bold text-brand-cta mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
              </svg>
              ویژگی‌ها
            </h4>
            <ul className="space-y-1.5">
              {info.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-primary">
                  <span className="w-5 h-5 rounded-full bg-brand-cta/10 text-brand-cta flex items-center justify-center shrink-0 mt-0.5">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>

          {/* Benefits */}
          <div>
            <h4 className="text-xs font-bold text-accent mb-2 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              مزایا و فواید
            </h4>
            <ul className="space-y-1.5">
              {info.benefits.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 mt-0.5">★</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer navigation */}
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          {prevSection ? (
            <button onClick={() => onScroll(prevSection)}
              className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-brand-cta transition-colors">
              ← {SECTION_INFO[prevSection]?.title}
            </button>
          ) : <div />}
          {nextSection ? (
            <button onClick={() => onScroll(nextSection)}
              className="flex items-center gap-1.5 text-xs font-medium text-brand-cta hover:opacity-80 transition-opacity">
              {SECTION_INFO[nextSection]?.title} ←
            </button>
          ) : (
            <span className="text-xs text-success font-bold">بازدید کامل شد! ✓</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Growth Path Section (exact replica) ─── */
function GrowthPathSection({ stages }: { stages: GrowthStage[] }) {
  const [openId, setOpenId] = useState<number | null>(stages[0]?.id ?? null);

  if (stages.length === 0) return null;
  const STAGE_ICONS = ["🎯", "👥", "🏆", "💼", "🏢", "⭐"];

  return (
    <section className="py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-12 text-center text-2xl font-bold text-brand-emphasis md:text-3xl">مسیر رشد نماینده</h2>
        <div className="flex flex-col gap-3">
          {stages.map((stage, i) => (
            <div key={stage.id} className="group rounded-2xl border border-border bg-bg-base shadow-sm transition-all duration-300 hover:shadow-md overflow-hidden">
              <button onClick={() => setOpenId(openId === stage.id ? null : stage.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-right transition-colors hover:bg-bg-surface/50">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand-cta text-white shadow-sm transition-transform duration-300 group-hover:scale-105 text-lg">
                  {STAGE_ICONS[i] ?? "★"}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[11px] font-semibold text-accent">مرحله {i + 1}</span>
                  <h3 className="text-base font-bold text-brand-emphasis leading-snug">{stage.title}</h3>
                </div>
                <svg className={`size-5 shrink-0 text-text-secondary transition-transform duration-300 ${openId === stage.id ? "rotate-180" : ""}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
              {openId === stage.id && (
                <div className="border-t border-border/50 px-5 py-4 animate-fade-in">
                  <p className="text-sm leading-relaxed text-text-secondary">{stage.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ Section (exact replica) ─── */
function FaqSection({ items }: { items: FaqItem[] }) {
  const [openId, setOpenId] = useState<number | null>(null);
  if (items.length === 0) return null;

  return (
    <section className="bg-bg-surface py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-10 text-center text-2xl font-bold text-brand-emphasis md:text-3xl">پرسش و پاسخ پیش از مصاحبه</h2>
        <div className="divide-y divide-border rounded-xl border border-border bg-bg-base">
          {items.map((item) => (
            <div key={item.id}>
              <button onClick={() => setOpenId(openId === item.id ? null : item.id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-right transition-colors hover:bg-bg-surface/50">
                <span className="text-base font-bold text-brand-emphasis">{item.question}</span>
                <span className="flex size-6 shrink-0 items-center justify-center rounded-md text-text-secondary transition-transform duration-300">
                  {openId === item.id ? "−" : "+"}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${openId === item.id ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                style={{ display: "grid" }}>
                <div className="min-h-0">
                  <p className="px-6 pb-5 text-sm leading-relaxed text-text-secondary">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
