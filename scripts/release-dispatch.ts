// scripts/release-dispatch.ts — رویداد template-update به همه ریپوهای خریداران
//
// پس از هر انتشار (tag push)، با یک دستور همه کلون‌های خصوصی خریداران که
// workflow «Auto update from upstream» دارند، بلافاصله به‌روزرسانی می‌شوند
// (وگرنه روزانه در ساعت ۳ UTC خودکار sync می‌شوند).
//
// پیش‌نیازها:
//   1) customers.json در ریشه پروژه: آرایه‌ای از "owner/repo" خریداران
//      مثال: ["my-org/buyer-ahmadi", "my-org/buyer-mohammadi"]
//   2) توکن GitHub با دسترسی admin به آن ریپوها:
//        PowerShell:  $env:GITHUB_TOKEN = "ghp_..."
//        Bash:        export GITHUB_TOKEN="ghp_..."
//   3) npm run release
//
// Usage: npm run release [-- v1.2.3]   (نسخه از package.json اگر داده نشود)

import { readFileSync } from "node:fs";

const version = process.argv[2] ?? JSON.parse(readFileSync("package.json", "utf-8")).version;
const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error("GITHUB_TOKEN تنظیم نشده است");
  process.exit(1);
}

let customers: string[];
try {
  customers = JSON.parse(readFileSync("customers.json", "utf-8"));
} catch {
  console.error("customers.json پیدا نشد یا معتبر نیست — لیست ریپوهای خریداران را در آن بگذارید");
  process.exit(1);
}

if (!Array.isArray(customers) || customers.length === 0) {
  console.log("customers.json خالی است — کاری برای انجام دادن نیست");
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (const repo of customers) {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
      method: "POST",
      headers: {
        accept: "application/vnd.github+json",
        authorization: `Bearer ${token}`,
        "x-github-api-version": "2022-11-28",
        "user-agent": "template-release-dispatch",
      },
      body: JSON.stringify({
        event_type: "template-update",
        client_payload: { version },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (res.status === 204) {
      ok++;
      console.log(`OK  ${repo}`);
    } else {
      failed++;
      console.error(`ERR ${repo} — HTTP ${res.status}`);
    }
  } catch (err) {
    failed++;
    console.error(`ERR ${repo} — ${err instanceof Error ? err.message : err}`);
  }
  // احترام به rate limit
  await new Promise((r) => setTimeout(r, 300));
}

console.log(`\nپایان: ${ok} موفق، ${failed} ناموفق (نسخه ${version})`);
if (failed > 0) process.exit(2);
