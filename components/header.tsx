"use client";

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_ITEMS = [
  { href: "#manager-profile", label: "پروفایل مدیر" },
  { href: "#success-wall", label: "موفقیت‌ها" },
  { href: "#growth-path", label: "مسیر رشد" },
  { href: "#faq", label: "پرسش‌های متداول" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-base/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link
          href="/apply"
          className="rounded-lg bg-brand-cta px-4 py-2 text-sm font-medium text-white no-underline transition-opacity hover:opacity-90"
        >
          درخواست نمایندگی
        </Link>

        <ul className="hidden items-center gap-6 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-sm text-text-secondary no-underline transition-colors hover:text-text-primary"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/login"
            className="flex size-9 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-colors"
            title="ورود مدیر"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
