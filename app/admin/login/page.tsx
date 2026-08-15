"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Mode = "login" | "request" | "reset";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [passwordSet, setPasswordSet] = useState(true);
  const [mode, setMode] = useState<Mode>("login");
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/login")
      .then((r) => r.json())
      .then((d) => setPasswordSet(!!d.passwordSet))
      .catch(() => setPasswordSet(true))
      .finally(() => setChecking(false));
  }, []);

  async function requestCode() {
    setLoading(true);
    setError("");
    setInfo("در حال ارسال کد به تلگرام...");
    try {
      const res = await fetch("/api/admin/login/reset-request", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "خطا در ارسال کد");
        setInfo("");
        return;
      }
      setInfo("کد تأیید به تلگرام شما ارسال شد. آن را وارد کنید.");
      setMode("reset");
    } catch {
      setError("خطا در ارتباط با سرور");
      setInfo("");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (mode === "reset") {
      if (!code.trim()) {
        setError("لطفاً کد تأیید را وارد کنید");
        setLoading(false);
        return;
      }
      if (password !== confirm) {
        setError("رمز عبور و تکرار آن یکسان نیستند");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
        setLoading(false);
        return;
      }
    }

    const body: Record<string, string | boolean> = {};
    if (mode === "reset") {
      body.reset_code = code.trim();
      body.new_password = password;
    } else if (passwordless && passwordSet) {
      body.passwordless = true;
    } else {
      body.password = password;
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "خطا در ورود");
        return;
      }

      router.push("/admin");
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  const isRecover = mode === "reset";
  const isSetting = !isRecover && !passwordSet && mode === "login";
  const [passwordless, setPasswordless] = useState(false);

  const title = mode === "request" || mode === "reset"
    ? "بازیابی رمز عبور"
    : "پنل مدیریت";

  const subtitle = mode === "request"
    ? "برای دریافت کد تأیید روی دکمه زیر کلیک کنید"
    : mode === "reset"
      ? "کد تأیید تلگرام را وارد کرده و رمز عبور جدید خود را بنویسید"
      : "با رمز عبور یا بدون رمز وارد شوید";

  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-sm animate-scale-in">
        <div className="rounded-2xl border border-border bg-bg-surface p-8 shadow-sm">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-cta text-white shadow-sm">
              <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-text-primary">{title}</h1>
            <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>
          </div>

          {checking ? (
            <div className="flex justify-center py-4">
              <div className="size-6 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {mode === "request" && (
                <button
                  type="button"
                  onClick={requestCode}
                  disabled={loading}
                  className="w-full rounded-lg bg-brand-cta px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "در حال ارسال..." : "ارسال کد تأیید به تلگرام"}
                </button>
              )}

              {mode === "reset" && (
                <div className="relative">
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="کد تأیید (۶ رقم)"
                    inputMode="numeric"
                    autoFocus
                    className="w-full rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta text-center tracking-widest"
                  />
                </div>
              )}

              {mode !== "request" && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isRecover ? "رمز عبور جدید" : "رمز عبور"}
                    autoFocus={mode !== "reset"}
                    disabled={passwordless && passwordSet}
                    className="w-full rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2.5 pe-10 focus:outline-none focus:ring-2 focus:ring-brand-cta text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                      </svg>
                    ) : (
                      <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="passwordless"
                    checked={passwordless}
                    onChange={(e) => {
                      setPasswordless(e.target.checked);
                      if (e.target.checked) setPassword("");
                    }}
                    className="size-4 rounded border-border text-brand-cta focus:ring-brand-cta"
                  />
                  <label htmlFor="passwordless" className="text-sm text-text-secondary">
                    ورود بدون رمز عبور
                  </label>
                </div>
              )}

              {mode === "reset" && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="تکرار رمز عبور جدید"
                    className="w-full rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2.5 pe-10 focus:outline-none focus:ring-2 focus:ring-brand-cta text-center"
                  />
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-500">
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {error}
                </div>
              )}

              {info && (
                <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
                  <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  {info}
                </div>
              )}

              {mode !== "request" && (
                <button
                  type="submit"
                  disabled={loading || (!password && !passwordless) || (isRecover && (!confirm || !code)) || checking}
                  className="w-full rounded-lg bg-brand-cta px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {loading
                    ? "در حال بررسی..."
                    : isRecover
                      ? "تغییر رمز عبور"
                      : passwordSet
                        ? "ورود"
                        : "تعیین رمز عبور"}
                </button>
              )}

              {mode !== "request" && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setInfo("");
                      setPassword("");
                      setConfirm("");
                      setCode("");
                      setMode("login");
                    }}
                    className="text-xs font-medium text-text-secondary hover:text-brand-cta transition-colors"
                  >
                    بازگشت به ورود
                  </button>
                </div>
              )}

              {mode === "login" && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setInfo("");
                      setMode("request");
                    }}
                    className="text-xs font-medium text-text-secondary hover:text-brand-cta transition-colors"
                  >
                    فراموشی رمز عبور
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
