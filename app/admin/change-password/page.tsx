"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api-client";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("رمز جدید و تکرار آن مطابقت ندارند");
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setError("رمز جدید باید حداقل ۶ کاراکتر باشد");
      setLoading(false);
      return;
    }

    try {
      const res = await adminFetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "خطا در تغییر رمز");
        return;
      }

      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md py-12 px-4">
      <div className="rounded-2xl border border-border bg-bg-surface p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-brand-cta text-white shadow-sm">
            <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary">تغییر رمز عبور</h1>
          <p className="mt-1 text-sm text-text-secondary">رمز عبور خود را تغییر دهید</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">رمز فعلی</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="رمز فعلی"
                autoFocus
                className="w-full rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">رمز جدید</label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              className="w-full rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-text-secondary">تکرار رمز جدید</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="تکرار رمز جدید"
              className="w-full rounded-lg border border-border bg-bg-base text-text-primary px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-cta"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="rounded border-border accent-brand-cta"
            />
            نمایش رمز عبور
          </label>

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

          {success && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
              <svg className="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              رمز عبور با موفقیت تغییر کرد
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !currentPassword || !newPassword || !confirmPassword}
              className="flex-1 rounded-lg bg-brand-cta px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "در حال ذخیره..." : "ذخیره رمز جدید"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-base"
            >
              بازگشت
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
