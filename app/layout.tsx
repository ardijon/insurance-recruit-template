import type { Metadata } from "next";
import LocalFont from "next/font/local";
import "./globals.css";

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

function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let themeClass = "theme-warm";

  if (!isDemoMode()) {
    try {
      const { selectOne, ensureSchema } = await import("@/lib/db");
      await ensureSchema();
      const row = await selectOne(
        "SELECT site_theme FROM manager_profile WHERE id = 1"
      ) as { site_theme: string } | undefined;
      if (row?.site_theme === "dark") themeClass = "theme-dark";
    } catch {
      // Use default theme if DB not available
    }
  }

  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${themeClass}`}>
      <body>{children}</body>
    </html>
  );
}
