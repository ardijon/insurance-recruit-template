"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/api-client";

export default function SettingsPage() {
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [socialTelegram, setSocialTelegram] = useState("");
  const [socialWhatsapp, setSocialWhatsapp] = useState("");
  const [socialInstagram, setSocialInstagram] = useState("");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        setBotToken(data.TELEGRAM_BOT_TOKEN ?? "");
        setChatId(data.TELEGRAM_CHAT_ID ?? "");
        setSocialTelegram(data.SOCIAL_TELEGRAM ?? "");
        setSocialWhatsapp(data.SOCIAL_WHATSAPP ?? "");
        setSocialInstagram(data.SOCIAL_INSTAGRAM ?? "");
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await adminFetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          TELEGRAM_BOT_TOKEN: botToken,
          TELEGRAM_CHAT_ID: chatId,
          SOCIAL_TELEGRAM: socialTelegram,
          SOCIAL_WHATSAPP: socialWhatsapp,
          SOCIAL_INSTAGRAM: socialInstagram,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error ?? "خطا در ذخیره تنظیمات");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      alert("خطا در اتصال به سرور");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await adminFetch("/api/admin/settings/test-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken, chatId: chatId }),
      });
      const data = await res.json();
      setTestResult({ ok: res.ok, msg: res.ok ? "پیام آزمایشی ارسال شد!" : (data.error ?? "خطا در اتصال") });
    } catch {
      setTestResult({ ok: false, msg: "خطا در اتصال به سرور" });
    } finally {
      setTesting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-text-primary mb-2">تنظیمات</h1>
      <p className="text-sm text-text-secondary mb-6">
        تنظیمات تلگرام و شبکه‌های اجتماعی خود را مدیریت کنید.
      </p>

      {/* ========== Telegram Section ========== */}
      <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
        <svg className="size-5 text-brand-cta" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
        </svg>
        اتصال تلگرام (اعلان فوری)
      </h2>

      <p className="text-sm text-text-secondary mb-4">
        با تنظیم این بخش، هر درخواست نمایندگی جدید بلافاصله به تلگرام شما ارسال می‌شود.
      </p>

      {/* Step-by-step guide */}
      <div className="rounded-2xl border border-border bg-bg-surface p-5 mb-6">
        <h3 className="text-sm font-bold text-text-primary mb-3">راهنمای اتصال (۳ مرحله ساده)</h3>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-cta text-sm font-bold text-white">۱</div>
            <div>
              <p className="text-sm font-medium text-text-primary">ساخت ربات تلگرام</p>
              <p className="text-xs text-text-secondary mt-0.5">
                به <a href="https://t.me/BotFather" target="_blank" rel="noopener noreferrer" className="text-brand-cta underline">@BotFather</a> در تلگرام پیام بدید و دستور <code className="rounded bg-bg-base px-1 py-0.5 text-[11px]">/newbot</code> رو بزنید. یه اسم و یوزرنیم انتخاب کنید.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-cta text-sm font-bold text-white">۲</div>
            <div>
              <p className="text-sm font-medium text-text-primary">کپی توکن ربات</p>
              <p className="text-xs text-text-secondary mt-0.5">
                بعد از ساخت ربات، یه توکن بلند بهتون داده می‌شه (شبیه <code className="rounded bg-bg-base px-1 py-0.5 text-[11px]">123456:ABC-DEF...</code>). اون رو کپی کنید و توی فیلد زیر بزنید.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-cta text-sm font-bold text-white">۳</div>
            <div>
              <p className="text-sm font-medium text-text-primary">گرفتن شناسه چت</p>
              <p className="text-xs text-text-secondary mt-0.5">
                ربات رو به گروه مدیریت اضافه کنید. بعد به <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-brand-cta underline">@userinfobot</a> پیام بدید تا شناسه چت (Chat ID) رو بهتون بده. عدد مثبت یا منفی مثل <code className="rounded bg-bg-base px-1 py-0.5 text-[11px]">-1001234567890</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Telegram Form */}
      <div className="rounded-2xl border border-border bg-bg-surface p-5 space-y-4 mb-8">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">توکن ربات تلگرام</label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={botToken}
              onChange={(e) => { setBotToken(e.target.value); setSaved(false); setTestResult(null); }}
              placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
              className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            >
              {showToken ? (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">شناسه چت (Chat ID)</label>
          <input
            type="text"
            value={chatId}
            onChange={(e) => { setChatId(e.target.value); setSaved(false); setTestResult(null); }}
            placeholder="-1001234567890"
            className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
            dir="ltr"
          />
          <p className="mt-1 text-[11px] text-text-secondary">
            عدد مثبت یا منفی — می‌توانید شناسه خودتان یا شناسه گروه مدیریت را وارد کنید.
          </p>
        </div>

        {testResult && (
          <div className={`rounded-xl px-4 py-3 text-sm font-medium ${testResult.ok ? "bg-success/10 text-success" : "bg-red-500/10 text-red-500"}`}>
            {testResult.msg}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={handleTest}
            disabled={testing || !botToken || !chatId}
            className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-base disabled:opacity-50"
          >
            {testing ? "در حال تست..." : "تست اتصال"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !botToken || !chatId}
            className="flex-1 rounded-xl bg-brand-cta px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : saved ? "ذخیره شد ✓" : "ذخیره تنظیمات"}
          </button>
        </div>
      </div>

      {/* ========== Social Media Section ========== */}
      <h2 className="text-base font-bold text-text-primary mb-3 flex items-center gap-2">
        <svg className="size-5 text-brand-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
        شبکه‌های اجتماعی
      </h2>

      <p className="text-sm text-text-secondary mb-4">
        لینک پروفایل خود در شبکه‌های اجتماعی را وارد کنید. این لینک‌ها در فوتر سایت نمایش داده می‌شوند.
      </p>

      <div className="rounded-2xl border border-border bg-bg-surface p-5 space-y-4">
        {/* Telegram */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
            <svg className="size-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
            </svg>
            کانال یا پروفایل تلگرام
          </label>
          <input
            type="url"
            value={socialTelegram}
            onChange={(e) => { setSocialTelegram(e.target.value); setSaved(false); }}
            placeholder="https://t.me/your_channel"
            className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
            dir="ltr"
          />
        </div>

        {/* WhatsApp */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
            <svg className="size-4 text-success" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            واتساپ
          </label>
          <input
            type="url"
            value={socialWhatsapp}
            onChange={(e) => { setSocialWhatsapp(e.target.value); setSaved(false); }}
            placeholder="https://wa.me/989121234567"
            className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
            dir="ltr"
          />
          <p className="mt-1 text-[11px] text-text-secondary">
            فرمت صحیح: <code className="rounded bg-bg-base px-1 py-0.5">https://wa.me/989121234567</code> (شماره با کد کشور)
          </p>
        </div>

        {/* Instagram */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-text-primary mb-1.5">
            <svg className="size-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            اینستاگرام
          </label>
          <input
            type="url"
            value={socialInstagram}
            onChange={(e) => { setSocialInstagram(e.target.value); setSaved(false); }}
            placeholder="https://instagram.com/your_page"
            className="w-full rounded-xl border border-border bg-bg-base px-4 py-3 text-sm text-text-primary placeholder:text-text-secondary/50 focus:border-brand-cta focus:outline-none focus:ring-1 focus:ring-brand-cta/30 ltr text-left"
            dir="ltr"
          />
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full rounded-xl bg-brand-cta px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : saved ? "ذخیره شد ✓" : "ذخیره تنظیمات"}
          </button>
        </div>
      </div>
    </div>
  );
}
