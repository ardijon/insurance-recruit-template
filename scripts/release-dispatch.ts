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
const CLIENT_ORG = process.env.CLIENT_ORG ?? "tavana-clients";
const CLIENT_TOPIC = "tavana-client";

if (!token) {
  console.log("GITHUB_TOKEN تنظیم نشده است — dispatch انجام نشد (skip)");
  process.exit(0);
}

// Legacy fallback: customers.json (may be missing or empty — still []-safe).
let customers: string[] = [];
try {
  const parsed: unknown = JSON.parse(readFileSync("customers.json", "utf-8"));
  if (Array.isArray(parsed)) customers = parsed.filter((r): r is string => typeof r === "string");
} catch {
  console.log("customers.json پیدا نشد یا معتبر نیست — فقط کشف موضوعی (topic) انجام می‌شود");
}

// Topic-based discovery: all repos in CLIENT_ORG tagged with CLIENT_TOPIC.
async function discoverByTopic(): Promise<string[]> {
  const found: string[] = [];
  const headers = {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${token}`,
    "x-github-api-version": "2022-11-28",
    "user-agent": "template-release-dispatch",
  };
  try {
    for (let page = 1; page <= 10; page++) {
      const res = await fetch(
        `https://api.github.com/orgs/${CLIENT_ORG}/repos?per_page=100&page=${page}`,
        { headers, signal: AbortSignal.timeout(15000) },
      );
      if (!res.ok) {
        console.error(`کشف ریپوهای ${CLIENT_ORG} ناموفق بود — HTTP ${res.status} (ادامه با customers.json)`);
        break;
      }
      const repos = (await res.json()) as { full_name: string }[];
      if (repos.length === 0) break;
      for (const repo of repos) {
        try {
          const tRes = await fetch(`https://api.github.com/repos/${repo.full_name}/topics`, {
            headers,
            signal: AbortSignal.timeout(15000),
          });
          if (!tRes.ok) continue;
          const topics = (await tRes.json()) as { names?: string[] };
          if (topics.names?.includes(CLIENT_TOPIC)) found.push(repo.full_name);
        } catch {
          continue;
        }
      }
      if (repos.length < 100) break;
    }
  } catch (err) {
    console.error(`کشف موضوعی ناموفق بود — ادامه با customers.json (${err instanceof Error ? err.message : err})`);
  }
  return found;
}

const discovered = await discoverByTopic();
const repos = [...new Set([...customers, ...discovered])];

if (repos.length === 0) {
  console.log("هیچ ریپوی خریداری پیدا نشد (customers.json خالی و تاپیک tavana-client یافت نشد) — کاری برای انجام دادن نیست");
  process.exit(0);
}

let ok = 0;
let failed = 0;
for (const repo of repos) {
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
