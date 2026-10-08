"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useUpdateBadge } from "@/components/update-bell";
import { nowJalali, toPersianDigits } from "@/lib/jalali";
import { adminFetch } from "@/lib/api-client";

// ─── ساختار منو: سه گروه — مدیریت / محتوای سایت / سیستم ───
interface NavItem {
  href: string;
  label: string;
  icon: string;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "مدیریت",
    items: [
      { href: "/admin", label: "متقاضیان", icon: "people" },
      { href: "/admin/referrals", label: "لینک‌های معرف", icon: "link" },
    ],
  },
  {
    title: "محتوای سایت",
    items: [
      { href: "/admin/profile", label: "پروفایل مدیر", icon: "person" },
      { href: "/admin/success-wall", label: "موفقیت‌ها", icon: "star" },
      { href: "/admin/visual-story", label: "روایت تصویری", icon: "camera" },
      { href: "/admin/growth-path", label: "مسیر رشد", icon: "trend" },
      { href: "/admin/faq", label: "سوالات متداول", icon: "help" },
    ],
  },
  {
    title: "سیستم",
    items: [
      { href: "/admin/location", label: "موقعیت مکانی", icon: "pin" },
      { href: "/admin/updates", label: "به‌روزرسانی", icon: "bell" },
      { href: "/admin/settings", label: "تنظیمات", icon: "settings" },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);
const MOBILE_PRIMARY_HREFS = ["/admin", "/admin/profile", "/admin/success-wall"];
const MOBILE_PRIMARY = MOBILE_PRIMARY_HREFS.map(
  (href) => ALL_ITEMS.find((i) => i.href === href)!
);

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
  if (icon === "pin")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    );
  if (icon === "bell")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    );
  if (icon === "settings")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    );
  if (icon === "link")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    );
  if (icon === "more")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    );
  if (icon === "home")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    );
  if (icon === "lock")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    );
  if (icon === "logout")
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    );
  return null;
}

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="ms-auto flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold leading-none text-cta-contrast">
      {toPersianDigits(Math.min(count, 9))}
    </span>
  );
}

function SidebarLink({ item, active, badge = 0 }: { item: NavItem; active: boolean; badge?: number }) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium no-underline transition-colors ${
        active
          ? "bg-brand-cta/10 text-brand-cta"
          : "text-text-secondary hover:bg-bg-surface hover:text-text-primary"
      }`}
    >
      <NavIcon icon={item.icon} className="size-4.5 shrink-0" />
      <span className="truncate">{item.label}</span>
      <Badge count={badge} />
      {active && (
        <span className="absolute inset-y-1.5 right-0 w-0.5 rounded-full bg-brand-cta" aria-hidden />
      )}
    </Link>
  );
}

function GroupTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-1.5 px-3 text-[11px] font-semibold tracking-wide text-text-secondary/70">
      {children}
    </p>
  );
}

function LogoutButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() =>
        adminFetch("/api/auth/logout", { method: "POST" })
          .then(() => window.location.reload())
          .catch(() => alert("خطا در خروج از پنل"))
      }
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-danger no-underline transition-colors hover:bg-danger/10 ${className}`}
    >
      <NavIcon icon="logout" className="size-4.5 shrink-0" />
      خروج از حساب
    </button>
  );
}

function AdminDateDisplay() {
  const n = nowJalali();
  return (
    <p className="text-xs text-text-secondary">
      {toPersianDigits(n.day)} {n.monthName} {toPersianDigits(n.year)}
    </p>
  );
}

export function AdminNav() {
  const pathname = usePathname();
  const updateBadge = useUpdateBadge();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!drawerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [drawerOpen]);

  // بستن خودکار کشو پس از ناوبری
  const prevPathname = useRef(pathname);
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      setDrawerOpen(false);
    }
  }, [pathname]);

  const isUtilityActive = ["/admin/updates", "/admin/location", "/admin/settings"].includes(pathname);

  return (
    <>
      {/* ─── دسکتاپ: سایدبار ثابت سمت راست ─── */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-l border-border bg-bg-base md:flex">
        {/* برند */}
        <Link href="/admin" className="flex shrink-0 items-center gap-2.5 border-b border-border/60 px-4 py-4 no-underline">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-cta/10">
            <NavIcon icon="lock" className="size-4.5 text-brand-cta" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold leading-tight text-brand-emphasis">پنل مدیریت</p>
            <p className="truncate text-[10px] text-text-secondary">مدیریت جذب نمایندگان</p>
          </div>
        </Link>

        {/* گروه‌های ناوبری */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              <GroupTitle>{group.title}</GroupTitle>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    active={pathname === item.href}
                    badge={item.href === "/admin/updates" ? updateBadge : 0}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* ابزارهای پایین سایدبار */}
        <div className="shrink-0 space-y-0.5 border-t border-border/60 px-3 py-3">
          <SidebarLink item={{ href: "/", label: "مشاهده سایت", icon: "home" }} active={false} />
          <SidebarLink item={{ href: "/admin/change-password", label: "تغییر رمز عبور", icon: "lock" }} active={false} />
          <LogoutButton className="w-full" />
          <div className="mt-1 flex items-center justify-between border-t border-border/60 px-1 pt-2.5">
            <AdminDateDisplay />
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* ─── موبایل: نوار بالا ─── */}
      <header className="glass sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border px-4 md:hidden">
        <Link href="/admin" className="flex items-center gap-2 no-underline">
          <div className="flex size-8 items-center justify-center rounded-lg bg-brand-cta/10">
            <NavIcon icon="lock" className="size-4 text-brand-cta" />
          </div>
          <span className="text-sm font-bold text-brand-emphasis">پنل مدیریت</span>
        </Link>
        <div className="flex items-center gap-2">
          <AdminDateDisplay />
          <ThemeToggle />
        </div>
      </header>

      {/* ─── موبایل: نوار پایین ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-bg-base md:hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="flex items-center justify-around px-2 py-1.5">
          {MOBILE_PRIMARY.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 no-underline transition-colors min-w-0 ${
                  active ? "text-brand-cta" : "text-text-secondary"
                }`}
              >
                <NavIcon icon={item.icon} className={`size-5 ${active ? "stroke-[2.2]" : ""}`} />
                <span className="text-[10px] font-medium truncate">{item.label}</span>
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-brand-cta" />
                )}
              </Link>
            );
          })}

          {/* دکمه بیشتر */}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`relative flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors min-w-0 ${
              isUtilityActive ? "text-brand-cta" : "text-text-secondary"
            }`}
          >
            <NavIcon icon="more" className={`size-5 ${isUtilityActive ? "stroke-[2.2]" : ""}`} />
            <span className="text-[10px] font-medium">بیشتر</span>
            {updateBadge > 0 && (
              <span className="absolute top-0.5 right-2 flex size-3.5 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-cta-contrast">
                {toPersianDigits(Math.min(updateBadge, 9))}
              </span>
            )}
            {isUtilityActive && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-full bg-brand-cta" />
            )}
          </button>
        </div>
      </nav>

      {/* ─── موبایل: کشوی «بیشتر» ─── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 md:hidden" onClick={() => setDrawerOpen(false)} />
      )}

      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-border bg-bg-base transition-transform duration-300 md:hidden ${
          drawerOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-lg p-4">
          <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

          {NAV_GROUPS.map((group, gi) => (
            <div key={group.title} className={gi > 0 ? "mt-4" : ""}>
              <GroupTitle>{group.title}</GroupTitle>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.href}
                    item={item}
                    active={pathname === item.href}
                    badge={item.href === "/admin/updates" ? updateBadge : 0}
                  />
                ))}
              </div>
            </div>
          ))}

          <div className="my-3 h-px bg-border" />

          <div className="space-y-0.5 pb-2">
            <SidebarLink item={{ href: "/", label: "مشاهده سایت", icon: "home" }} active={false} />
            <SidebarLink item={{ href: "/admin/change-password", label: "تغییر رمز عبور", icon: "lock" }} active={false} />
            <LogoutButton className="w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
