import type { Metadata } from "next";
import LocalFont from "next/font/local";
import { isDemoMode } from "@/lib/demo";
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

const DEFAULT_TITLE = "سایت اختصاصی مدیر فروش بیمه عمر";
const DEFAULT_DESCRIPTION = "ابزاری برای جذب نماینده‌های باکیفیت‌تر";

// Dynamic tab title from the manager profile: "{name} | {title}".
// Falls back to the generic title when the profile is empty (fresh DB)
// or unavailable, so it stays correct for every management level.
export async function generateMetadata(): Promise<Metadata> {
  if (isDemoMode()) {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  }
  try {
    const { selectOne, ensureSchema } = await import("@/lib/db");
    await ensureSchema();
    const row = await selectOne(
      "SELECT name, title, bio FROM manager_profile WHERE id = 1"
    ) as { name?: string; title?: string; bio?: string } | undefined;
    const name = row?.name?.trim();
    const title = row?.title?.trim();
    const bio = row?.bio?.trim();
    if (!name && !title) {
      return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
    }
    return {
      title: [name, title].filter(Boolean).join(" | "),
      description: bio ? bio.slice(0, 155) : DEFAULT_DESCRIPTION,
    };
  } catch {
    return { title: DEFAULT_TITLE, description: DEFAULT_DESCRIPTION };
  }
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
