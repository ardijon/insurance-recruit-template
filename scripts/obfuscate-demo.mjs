// scripts/obfuscate-demo.mjs — مبهم‌سازی باندل کلاینت «فقط برای دیپلوی دمو»
//
// اجرا: پس از `@opennextjs/cloudflare build` و قبل از `wrangler deploy`
//   npm run cf:deploy:demo
//
// چه چیزی مبهم می‌شود:
//   فقط فایل‌های JS خودِ اپ در .open-next/assets/_next/static/chunks/**
// چه چیزی دست‌نخورده می‌ماند:
//   - chunkهای runtime/vendor (webpack, framework, polyfills, main-app)
//   - فایل‌های بزرگ (> 300KB — react-dom و ...)
//   - worker.js (باندل سرور — هرگز به مرورگر نمی‌رسد)
// تنظیمات عمداً محافظه‌کارانه است تا React hydration نشکند:
//   selfDefending/debugProtection/renameGlobals خاموش.
// همچنین هر سورس‌مپ (.map) پیدا شده در assets حذف می‌شود.

import { readFileSync, writeFileSync, readdirSync, rmSync, statSync, existsSync } from "node:fs";
import { join, relative, extname } from "node:path";
import JavaScriptObfuscator from "javascript-obfuscator";

// Gate: only run when explicitly requested (demo deploy pipeline). In buyer
// deployments javascript-obfuscator may not even be installed — exit silently.
if (process.env.OBFUSCATE_DEMO !== "1") {
  console.log("[obfuscate] skipped (OBFUSCATE_DEMO not set — buyer build)");
} else if (!existsSync(".open-next/assets/_next/static/chunks")) {
  console.error("ERR: .open-next/assets پیدا نشد");
  process.exit(1);
} else {
  run();
}

function run() {
  const ASSETS = ".open-next/assets";
  const CHUNKS = join(ASSETS, "_next", "static", "chunks");

  const VENDOR_PREFIXES = ["webpack", "framework", "polyfills", "main-app", "app/layout"];
  const MAX_SIZE = 300 * 1024;
  const VENDOR_MARKERS = ["react-dom", "react.production", "scheduler.production", "__webpack_require__"];

// ── 1) حذف هر سورس‌مپ از assets ──
let mapsRemoved = 0;
function stripMaps(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      stripMaps(p);
    } else if (extname(entry.name) === ".map") {
      rmSync(p);
      mapsRemoved++;
    }
  }
}
stripMaps(ASSETS);

// ── 2) جمع‌آوری chunkهای خود اپ ──
const targets = [];
function collect(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) {
      collect(p);
      continue;
    }
    if (extname(entry.name) !== ".js") continue;
    const base = entry.name.toLowerCase();
    if (VENDOR_PREFIXES.some((v) => base.startsWith(v))) continue;
    if (statSync(p).size > MAX_SIZE) continue;
    const content = readFileSync(p, "utf-8");
    if (VENDOR_MARKERS.some((m) => content.includes(m))) continue;
    targets.push(p);
  }
}
collect(CHUNKS);

// ── 3) مبهم‌سازی in-place ──
let before = 0;
let after = 0;
let done = 0;
const failed = [];
for (const file of targets) {
  const src = readFileSync(file, "utf-8");
  try {
    const result = JavaScriptObfuscator.obfuscate(src, {
      compact: true,
      simplify: true,
      stringArray: true,
      stringArrayThreshold: 0.7,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      identifierNamesGenerator: "hexadecimal",
      renameGlobals: false,
      selfDefending: false,
      debugProtection: false,
      disableConsoleOutput: false,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.35,
      deadCodeInjection: false,
      transformObjectKeys: false,
      unicodeEscapeSequence: false,
      numbersToExpressions: false,
      splitStrings: false,
      target: "browser",
      sourceMap: false,
    });
    const out = result.getObfuscatedCode();
    before += src.length;
    after += out.length;
    writeFileSync(file, out, "utf-8");
    done++;
  } catch (err) {
    failed.push(`${relative(ASSETS, file)}: ${err.message}`);
  }
}

  console.log(`[obfuscate] سورس‌مپ‌های حذف‌شده: ${mapsRemoved}`);
  console.log(`[obfuscate] مبهم‌سازی شد: ${done} فایل (${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB)`);
  if (failed.length > 0) {
    console.warn(`[obfuscate] ناموفق (${failed.length}):`);
    for (const f of failed) console.warn("  -", f);
    process.exit(2);
  }
}
