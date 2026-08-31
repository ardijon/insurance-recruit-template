// scripts/changelog.ts — تبدیل CHANGELOG.md به releases.json برای خریداران
//
// گردش کار مالک محصول پس از هر انتشار:
//   npm run changelog     → releases.json را می‌سازد
//   سپس فایل تولیدشده را در مکان عمومی منتشر کنید (مثلاً ریپوی عمومی
//   releases یا هر هاست https) — خریداران UPDATE_CHANGELOG_URL را به همان
//   آدرس pointing کرده‌اند. فرمت خروجی همان چیزی است که lib/update-center.ts می‌خواند.
//
// Usage: npm run changelog [-- out/releases.json]

import { readFileSync, writeFileSync } from "node:fs";

const OUT = process.argv[2] ?? "releases.json";

const raw = readFileSync("CHANGELOG.md", "utf-8");

// ## [1.2.0] - 2026-08-31 — عنوان
const HEADER = /^##\s*\[([^\]]+)\]\s*-\s*(\d{4}-\d{2}-\d{2})(?:\s*—\s*(.+))?\s*$/;

const releases: { version: string; date: string; title: string; notes: string[] }[] = [];
let current: (typeof releases)[number] | null = null;

for (const line of raw.split(/\r?\n/)) {
  const m = line.match(HEADER);
  if (m) {
    current = { version: m[1].trim(), date: m[2], title: (m[3] ?? m[1]).trim(), notes: [] };
    releases.push(current);
    continue;
  }
  const note = line.match(/^\s*[-*]\s+(.+)$/);
  if (note && current) current.notes.push(note[1].trim());
}

if (releases.length === 0) {
  console.error("هیچ نسخه‌ای در CHANGELOG.md پیدا نشد");
  process.exit(1);
}

writeFileSync(OUT, JSON.stringify({ releases }, null, 2) + "\n", "utf-8");
console.log(`OK: ${releases.length} نسخه در ${OUT} نوشته شد (آخرین: ${releases[0].version})`);
