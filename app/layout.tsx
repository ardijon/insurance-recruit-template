import type { Metadata } from "next";
import LocalFont from "next/font/local";
import "./globals.css";
import { selectOne, ensureSchema } from "@/lib/db";

const vazirmatn = LocalFont({
  src: [
    { path: "../public/fonts/Vazirmatn-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/Vazirmatn-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/Vazirmatn-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/Vazirmatn-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "سایت اختصاصی مدیر فروش بیمه عمر",
  description: "ابزاری برای جذب نماینده‌های باکیفیت‌تر",
};

let cachedTheme: { value: string; ts: number } | null = null;
const CACHE_TTL = 10_000;

async function getSiteTheme(): Promise<string> {
  const now = Date.now();
  if (cachedTheme && now - cachedTheme.ts < CACHE_TTL) return cachedTheme.value;
  await ensureSchema();
  const row = await selectOne(
    "SELECT site_theme FROM manager_profile WHERE id = 1"
  ) as { site_theme: string } | undefined;
  const theme = row?.site_theme ?? "warm";
  cachedTheme = { value: theme, ts: now };
  return theme;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeClass = (await getSiteTheme()) === "dark" ? "theme-dark" : "theme-warm";

  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${themeClass}`}>
      <body>{children}</body>
    </html>
  );
}
