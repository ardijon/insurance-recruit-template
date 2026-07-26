"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { nowJalali, toPersianDigits } from "@/lib/jalali";

const NAV_ITEMS = [
  { href: "/admin", label: "متقاضیان", icon: "people" },
  { href: "/admin/profile", label: "پروفایل", icon: "person" },
  { href: "/admin/success-wall", label: "موفقیت‌ها", icon: "star" },
  { href: "/admin/visual-story", label: "روایت تصویری", icon: "camera" },
  { href: "/admin/growth-path", label: "مسیر رشد", icon: "trend" },
  { href: "/admin/faq", label: "سوالات", icon: "help" },
] as const;

function NavIcon({ icon, className }: { icon: string; className?: string }) {
  if (icon === "people")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    );
  if (icon === "person")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  if (icon === "star")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  if (icon === "trend")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
      </svg>
    );
  if (icon === "help")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  if (icon === "camera")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    );
  return null;
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-bg-base/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Brand */}
          <Link href="/admin" className="flex items-center gap-2 text-brand-emphasis no-underline shrink-0">
            <div className="flex size-8 items-center justify-center rounded-lg bg-brand-cta/10">
              <svg className="size-4 text-brand-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <span className="text-base font-bold hidden sm:inline">پنل مدیریت</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
                    active
                      ? "bg-brand-cta/10 text-brand-cta"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-surface"
                  }`}
                >
                  <NavIcon icon={item.icon} className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex size-9 items-center justify-center rounded-lg text-text-secondary no-underline transition-colors hover:bg-bg-surface hover:text-text-primary"
              title="صفحه اصلی"
            >
              <svg className="size-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </Link>
            <AdminDateDisplay />
            <ThemeToggle />
            <button
              type="button"
              onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.reload())}
              className="hidden sm:inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-500 no-underline transition-colors hover:bg-red-500/10"
              title="خروج از پنل"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              خروج
            </button>
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-text-secondary no-underline transition-colors hover:text-text-primary hover:bg-bg-surface"
            >
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              سایت
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-base md:hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 no-underline transition-colors min-w-0 ${
                  active
                    ? "text-brand-cta"
                    : "text-text-secondary"
                }`}
              >
                <NavIcon icon={item.icon} className={`size-5 ${active ? "stroke-[2.2]" : ""}`} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

function AdminDateDisplay() {
  const n = nowJalali();
  const display = `${toPersianDigits(n.day)} ${n.monthName}`;
  return <p className="text-xs text-text-secondary hidden lg:block shrink-0">{display}</p>;
}
