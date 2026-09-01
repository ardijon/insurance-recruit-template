"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { toPersianDigits } from "@/lib/jalali";

// ─── دموی تک‌اسکرولی: یک صفحه، ۵ گام از بالا به پایین، موبایل-اول ───
// جایگزین تور کلیک‌به‌کلیک قبلی که در موبایل سردرگمی ایجاد می‌کرد.

interface Stats {
  currentAgentCount: number;
  growthAgents: number;
  growthPolicies: number;
  applicantsCount: number;
}

const STEPS = [
  { id: "story", label: "داستان" },
  { id: "site", label: "سایت شما" },
  { id: "panel", label: "پنل شما" },
  { id: "try", label: "امتحان کنید" },
  { id: "price", label: "قیمت و شروع" },
] as const;

const STORE_URL = "https://ai2apps.sbs/store/tavana";
const PRICE = "۹,۹۰۰,۰۰۰ تومان";
// واتساپ نیازمند فرمت بین‌المللی است (۰ ابتدای شماره حذف و کد کشور ۹۸ اضافه می‌شود)
const WHATSAPP_URL = "https://wa.me/989189199141";
const TELEGRAM_URL = "https://t.me/Ardalanpiri";

export function DemoPageClient({ stats }: { stats: Stats }) {
  const [active, setActive] = useState<string>("story");

  // هایلایت گام فعال هنگام اسکرول (IntersectionObserver — بدون listener سنگین)
  useEffect(() => {
    const sections = STEPS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => !!el
    );
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  const goTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const activeIdx = STEPS.findIndex((s) => s.id === active);

  return (
    <div className="min-h-screen bg-bg-base">
      {/* نوار گام‌ها — همیشه نمایان، بدون آیکن شلوغ */}
      <nav className="glass sticky top-0 z-50 border-b border-border">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-2 px-3">
          <span className="shrink-0 font-black text-brand-cta">demo</span>
          <div className="flex flex-1 items-center justify-center gap-1">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(s.id)}
                aria-label={s.label}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors ${
                  active === s.id
                    ? "bg-brand-cta text-cta-contrast"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                <span
                  className={`flex size-4 items-center justify-center rounded-full text-[9px] font-bold ${
                    active === s.id ? "bg-white/25" : "bg-bg-surface"
                  }`}
                >
                  {toPersianDigits(i + 1)}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            ))}
          </div>
          <span className="shrink-0 text-[11px] text-text-secondary" aria-live="polite">
            {toPersianDigits(activeIdx + 1)} از {toPersianDigits(STEPS.length)}
          </span>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* ═══ گام ۱ — داستان ═══ */}
        <section id="story" className="scroll-mt-16 pt-10">
          <StepBadge n={1} title="چرا این سیستم تفاوت ایجاد می‌کند؟" />

          <div className="mb-6 rounded-2xl border border-border bg-bg-surface p-5 text-center sm:p-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat value={toPersianDigits(stats.currentAgentCount)} label="نماینده فعال" tone="brand" />
              <Stat value={`+${toPersianDigits(stats.growthAgents)}٪`} label="رشد نمایندگان در ۶ ماه" tone="green" />
              <Stat value={`+${toPersianDigits(stats.growthPolicies)}٪`} label="رشد بیمه‌نامه در ۶ ماه" tone="green" />
              <Stat value={toPersianDigits(stats.applicantsCount)} label="متقاضی در این دمو" tone="brand" />
            </div>
            <p className="mt-3 text-[11px] text-text-secondary">
              ☝️ همه اعداد این صفحه «داده نمایشی» هستند تا عملکرد سیستم را نشان دهند.
            </p>
          </div>

          {/* روش سنتی */}
          <div className="mb-4 rounded-2xl border border-danger/20 bg-danger/5 p-5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
              <span className="text-lg">⛔</span> جذب به روش سنتی
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-bg-surface p-4">
                <p className="mb-2 text-xs font-bold text-danger">چالش مدیر</p>
                <ul className="space-y-1.5 text-sm leading-relaxed text-text-secondary">
                  <li>• مصاحبه کورکورانه — بدون اطلاع از سوابق و توانایی فرد</li>
                  <li>• ساعت‌ها وقت صرف کسانی که نمی‌مانند</li>
                  <li>• تصمیم بر اساس احساس، نه داده</li>
                </ul>
              </div>
              <div className="rounded-xl bg-bg-surface p-4">
                <p className="mb-2 text-xs font-bold text-danger">چالش متقاضی</p>
                <ul className="space-y-1.5 text-sm leading-relaxed text-text-secondary">
                  <li>• ورود ناآگاهانه به فضای رسمی و استرس‌زای مصاحبه</li>
                  <li>• ماه‌ها سردرگمی تا زیبایی و قدرت تیم‌سازی این شغل را بفهمد</li>
                  <li>• ناامیدی و ترک شغل در ماه‌های اول</li>
                </ul>
              </div>
            </div>
          </div>

          {/* با این سیستم */}
          <div className="mb-4 rounded-2xl border border-success/30 bg-success/5 p-5 sm:p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-text-primary">
              <span className="text-lg">✅</span> با این سیستم
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-bg-surface p-4">
                <p className="mb-2 text-xs font-bold text-success">دست مدیر باز می‌شود</p>
                <ul className="space-y-1.5 text-sm leading-relaxed text-text-secondary">
                  <li>• قبل از مصاحبه، سوابق و توانایی هر فرد را می‌بیند</li>
                  <li>• <strong className="text-text-primary">امتیاز خودکار</strong> می‌گوید چه کسی شانس موفقیت دارد</li>
                  <li>• فقط روی افراد باانگیزه وقت می‌گذارد؛ یعنی بهره‌وری بالاتر</li>
                </ul>
              </div>
              <div className="rounded-xl bg-bg-surface p-4">
                <p className="mb-2 text-xs font-bold text-success">متقاضی آگاهانه تصمیم می‌گیرد</p>
                <ul className="space-y-1.5 text-sm leading-relaxed text-text-secondary">
                  <li>• بدون فشار مصاحبه، همه‌چیز را در سایت می‌خواند</li>
                  <li>• مسیر رشد، درآمد و واقعیت شغل را از قبل می‌فهمد</li>
                  <li>• نتیجه: <strong className="text-text-primary">ماندگاری بیشتر و انگیزه‌ی بالاتر در ماه‌های اول کار</strong></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-brand-emphasis/5 p-5 text-center ring-1 ring-brand-emphasis/15">
            <p className="text-base font-bold leading-relaxed text-brand-emphasis sm:text-lg">
              «متقاضی نسبت به آینده شغل نمایندگی بیمه آگاه می‌شود و مدیر هوشمند هم با این سیستم فقط روی آدم‌های درست وقت می‌گذارد.»
            </p>
          </div>

          <NextStep onClick={() => goTo("site")} label="حالا ببینید سایت شما چه شکلی است" />
        </section>

        {/* ═══ گام ۲ — سایت شما ═══ */}
        <section id="site" className="scroll-mt-16 pt-14">
          <StepBadge n={2} title="سایتی که متقاضی می‌بیند" />
          <p className="mb-5 leading-relaxed text-text-secondary">
            این قالب کامل است، نه طرح اولیه. متقاضی بدون هیچ فشاری این‌جا آگاه می‌شود و خودش
            تصمیم می‌گیرد درخواست بدهد.
          </p>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <Feature icon="👤" title="پروفایل مدیر" desc="سوابق، افتخارات و آمار رشد شما — اولین چیزی که اعتماد می‌سازد" />
            <Feature icon="🏆" title="دیوار موفقیت" desc="نظرات و عکس نمایندگان موفق شما — قوی‌ترین ابزار جذب" />
            <Feature icon="📈" title="مسیر رشد" desc="از بازاریاب تا مدیر ارشد — آینده روشن جلوی چشم متقاضی" />
            <Feature icon="🗺️" title="نقشه و آدرس" desc="محل فعالیت شما روی گوگل مپ + مسیریابی با نشان و بلد" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/"
              className="flex-1 rounded-xl bg-brand-cta px-5 py-3.5 text-center text-sm font-bold text-cta-contrast transition-opacity hover:opacity-90"
            >
              باز کردن سایت واقعی ↗
            </Link>
            <button
              type="button"
              onClick={() => goTo("panel")}
              className="flex-1 rounded-xl border border-border px-5 py-3.5 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface"
            >
              نه، پنل را نشان بده
            </button>
          </div>
        </section>

        {/* ═══ گام ۳ — پنل شما ═══ */}
        <section id="panel" className="scroll-mt-16 pt-14">
          <StepBadge n={3} title="پنل مدیریت — همه‌چیز در دست خودتان" />
          <p className="mb-5 leading-relaxed text-text-secondary">
            نکته مهم: <strong className="text-text-primary">نگهداری این سایت نیازی به برنامه‌نویس ندارد.</strong>{" "}
            هر چیزی که در دمو می‌بینید، خودتان از پنل مدیریت تغییر می‌دهید.
          </p>

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <Feature icon="🧑‍💼" title="متقاضیان با امتیاز" desc="هر درخواست بلافاصله امتیاز می‌گیرد — تماس با بهترین‌ها اول" />
            <Feature icon="📅" title="وقت ملاقات" desc="تقویم شمسی با بازه‌های نیم‌ساعته؛ زمان رزروشده دوباره انتخاب نمی‌شود" />
            <Feature icon="🖼️" title="عکس و متن" desc="پروفایل، موفقیت‌ها و روایت تصویری را خودتان به‌روز می‌کنید" />
            <Feature icon="🔔" title="اطلاع فوری تلگرام" desc="با هر درخواست جدید، پیام با امتیاز متقاضی روی گوشی شماست" />
          </div>

          <Link
            href="/admin"
            className="block rounded-xl bg-brand-cta px-5 py-3.5 text-center text-sm font-bold text-cta-contrast transition-opacity hover:opacity-90"
          >
            ورود آزمایشی به پنل (بدون رمز) ↗
          </Link>
          <p className="mt-2 text-center text-[11px] text-text-secondary">
            در پنل، دکمه «تعیین وقت» را بزنید تا تقویم شمسی و بازه‌های نیم‌ساعته را ببینید.
          </p>
        </section>

        {/* ═══ گام ۴ — خودتان امتحان کنید ═══ */}
        <section id="try" className="scroll-mt-16 pt-14">
          <StepBadge n={4} title="خودتان امتحان کنید — چیزی خراب نمی‌شود" />
          <p className="mb-5 leading-relaxed text-text-secondary">
            بهترین راه فهمیدن: یک بار در نقش متقاضی فرم را پر کنید، بعد در نقش مدیر نتیجه را
            ببینید. همه‌چیز نمایشی است و با بستن مرورگر پاک می‌شود.
          </p>

          <ol className="mb-5 space-y-3">
            <TryStep n="۱" text="فرم ۳ مرحله‌ای را پر کنید — بلافاصله امتیاز خودتان را می‌بینید" href="/apply" hrefLabel="فرم درخواست" />
            <TryStep n="۲" text="وارد پنل شوید — درخواست شما با همان امتیاز بالای لیست است" href="/admin" hrefLabel="ورود به پنل" />
            <TryStep n="۳" text="وضعیت را عوض کنید و وقت ملاقات بگذارید — دقیقاً کاری که بعد از خرید انجام می‌دهید" href="/admin" hrefLabel="ادامه در پنل" />
          </ol>

          <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm leading-relaxed text-text-secondary">
            💡 در نسخه اصلی، لحظه‌ای که متقاضی فرم را می‌فرستد، <strong className="text-text-primary">پیام تلگرام
            با امتیاز او روی گوشی شما می‌رسد</strong> — این‌جا در دمو پیام واقعی ارسال نمی‌شود.
          </div>

          <NextStep onClick={() => goTo("price")} label="قیمت و نحوه شروع" />
        </section>

        {/* ═══ گام ۵ — قیمت و شروع ═══ */}
        <section id="price" className="scroll-mt-16 pt-14">
          <StepBadge n={5} title="قیمت و شروع" />

          <div className="rounded-2xl border border-border bg-bg-surface p-5 text-center sm:p-8">
            <p className="text-sm text-text-secondary">یک‌بار پرداخت — مالکیت کامل</p>
            <p className="mt-2 text-3xl font-black text-brand-emphasis sm:text-4xl">{PRICE}</p>

            <ul className="mx-auto mt-6 max-w-sm space-y-2 text-right">
              {[
                "قالب کامل + پنل مدیریت فارسی",
                "نصب کامل روی هاست و دامنه‌ی شما — تمام مراحل را تیم ما انجام می‌دهد",
                "آموزش کار با پنل + به‌روزرسانی رایگان تا ۶ ماه",
                "پشتیبانی ۳۰ روزه پس از خرید",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-text-primary">
                  <svg className="mt-0.5 size-4 shrink-0 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <a
              href={STORE_URL}
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-cta py-4 font-bold text-cta-contrast shadow-lg transition-all hover:opacity-90 active:scale-[0.98]"
            >
              <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              خرید و شروع — {PRICE}
            </a>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">
              سؤالی دارید؟ همین حالا بپرسید — پاسخ‌گویی قبل از خرید:
            </p>
            <div className="mt-2 flex justify-center gap-3 text-sm font-medium">
              <a href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-brand-cta hover:underline">تلگرام</a>
              <span className="text-border">|</span>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-success hover:underline">واتساپ</a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

/* ─── اجزای کوچک ─── */

function StepBadge({ n, title }: { n: number; title: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-bold tracking-wide text-brand-cta">
        گام {toPersianDigits(n)}
      </p>
      <h2 className="mt-1 text-xl font-black text-brand-emphasis sm:text-2xl">{title}</h2>
    </div>
  );
}

function Stat({ value, label, tone }: { value: string; label: string; tone: "brand" | "green" }) {
  return (
    <div className="rounded-xl bg-bg-base p-3 ring-1 ring-border/60">
      <div className={`text-xl font-black ${tone === "green" ? "text-success" : "text-brand-cta"}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] leading-tight text-text-secondary">{label}</div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-border bg-bg-surface p-4">
      <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-brand-cta/10 text-lg">
        {icon}
      </div>
      <h3 className="text-sm font-bold text-brand-emphasis">{title}</h3>
      <p className="mt-1 text-xs leading-relaxed text-text-secondary">{desc}</p>
    </div>
  );
}

function TryStep({ n, text, href, hrefLabel }: { n: string; text: string; href: string; hrefLabel: string }) {
  return (
    <li className="flex items-center gap-3 rounded-2xl border border-border bg-bg-surface p-4">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-cta text-sm font-bold text-cta-contrast">
        {n}
      </span>
      <p className="flex-1 text-sm leading-relaxed text-text-secondary">{text}</p>
      <Link
        href={href}
        className="shrink-0 rounded-lg bg-brand-cta/10 px-3 py-2 text-xs font-bold text-brand-cta transition-colors hover:bg-brand-cta/20"
      >
        {hrefLabel}
      </Link>
    </li>
  );
}

function NextStep({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <div className="mt-8 flex justify-center border-t border-border pt-6">
      <button
        type="button"
        onClick={onClick}
        className="rounded-xl bg-brand-cta px-6 py-3 text-sm font-bold text-cta-contrast transition-opacity hover:opacity-90"
      >
        {label} ←
      </button>
    </div>
  );
}
