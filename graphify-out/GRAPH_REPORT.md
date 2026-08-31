# Graph Report - manager-tavana  (2026-08-31)

## Corpus Check
- 149 files · ~87,231 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1043 nodes · 1831 edges · 84 communities (59 shown, 16 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83e41e55`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- update-bell.tsx
- jalali.ts
- applications/route.ts
- app/page.tsx
- compilerOptions
- api-client.ts
- auth.ts
- dependencies
- devDependencies
- settings/route.ts
- Prompt برای Claude — پروژه Insurance Recruit SaaS
- adminFetch
- opencode.json
- graphify.js
- AdminLoginPage
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- Security Changes Summary - Tavana Demo
- What You Must Do When Invoked
- راهنمای دموی حرفه‌ای — سیستم جذب نماینده بیمه
- Security Documentation - Tavana Demo
- راهنمای گردش‌کار: Graphify + مهندسی قوانین برای OpenCode
- demo-client.tsx
- applicant-filters.tsx
- toPersianDigits
- growth-path/page.tsx
- Insurance Recruit Template — وضعیت پروژه
- AGENTS.md — Master Instructions for AI Coding Agents
- jalali-calendar.tsx
- SuccessWallPage
- walkthrough-client.tsx
- admin/page.tsx
- اجرا (۲ دقیقه قبل از شروع ارائه)
- updates/page.tsx
- FaqPage
- GrowthPathPage
- تغییرات قالب جذب نمایندگان بیمه
- run-seed.ts
- changelog.ts
- GRAPHIFY-CHECKLIST-fa.md — چک‌لیست دستورات، فقط برای پروژه‌های بزرگ
- PHASE-PROMPTS-fa.md — پرامپت‌های آماده برای هر فاز
- package.json
- graphify reference: extra exports and benchmark
- scripts
- LocationPage
- راهنمای حالت دمو
- COMMANDS-fa.md — چیت‌شیت دستورات (کی، کجا، چرا)
- tsx
- design.md
- roadmap.md
- edge.md
- graphify reference: query, path, explain
- prompts/scaffold.md — Scaffold Phase
- سایت اختصاصی مدیر فروش بیمه عمر
- update.sh
- prompts/escalate.md — Escalation Protocol
- prompts/polish.md — Polish Phase
- prompts/setup-interview.md — Phase 0: Interview & Draft
- ensureSchema
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native CLAUDE.md integration
- graphify reference: incremental update and cluster-only
- set_pw.js
- upload_test.js
- check_db.js
- qr-code.tsx
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- eslint-config-next
- extraction-spec.md
- @types/react
- @types/react-dom
- update-center.ts
- app/layout.tsx

## God Nodes (most connected - your core abstractions)
1. `ensureSchema()` - 85 edges
2. `isAdminRequest()` - 60 edges
3. `adminFetch()` - 52 edges
4. `executeUpdate()` - 42 edges
5. `selectOne()` - 42 edges
6. `isDemoMode()` - 30 edges
7. `executeInsert()` - 29 edges
8. `selectAll()` - 26 edges
9. `toPersianDigits()` - 25 edges
10. `راهنمای گردش‌کار: Graphify + مهندسی قوانین برای OpenCode` - 18 edges

## Surprising Connections (you probably didn't know these)
- `handleSave()` --calls--> `adminFetch()`  [EXTRACTED]
  app/admin/location/page.tsx → lib/api-client.ts
- `handleStatusChange()` --calls--> `adminFetch()`  [EXTRACTED]
  app/admin/page.tsx → lib/api-client.ts
- `handleDelete()` --calls--> `adminFetch()`  [EXTRACTED]
  app/admin/page.tsx → lib/api-client.ts
- `handleDeploy()` --calls--> `adminFetch()`  [EXTRACTED]
  app/admin/updates/page.tsx → lib/api-client.ts
- `prevMonth()` --calls--> `getJalaliYearMonth()`  [EXTRACTED]
  components/jalali-date-picker.tsx → lib/jalali.ts

## Import Cycles
- None detected.

## Communities (84 total, 16 thin omitted)

### Community 0 - "update-bell.tsx"
Cohesion: 0.50
Nodes (4): isNewer(), ReleaseEntry, UpdateCenterInfo, useUpdateBadge()

### Community 1 - "jalali.ts"
Cohesion: 0.14
Nodes (20): todayJalaliStr(), formatValue(), JalaliDatePicker(), nextMonth(), prevMonth(), selectDay(), JalaliDatePickerProps, parseValue() (+12 more)

### Community 2 - "applications/route.ts"
Cohesion: 0.07
Nodes (34): POST(), ApplicationForm(), handleSubmit(), nextStep(), validateStep(), STEP2_QUESTIONS, Step2Structured, StepErrors (+26 more)

### Community 3 - "app/page.tsx"
Cohesion: 0.05
Nodes (42): DEMO_DATA, getCachedData, HomePage(), AnimateOnShow(), FaqItem, FaqSection(), Footer(), SocialLinks (+34 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "api-client.ts"
Cohesion: 0.32
Nodes (6): FaqItem, INITIAL, ProfileData, Entry, ToastContainer(), Toast

### Community 6 - "auth.ts"
Cohesion: 0.11
Nodes (35): POST(), POST(), GET(), POST(), GET(), POST(), RFC-1918, bufToHex() (+27 more)

### Community 7 - "dependencies"
Cohesion: 0.22
Nodes (9): next, dependencies, next, react, react-dom, zod, react, react-dom (+1 more)

### Community 8 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, @opennextjs/cloudflare, devDependencies, eslint, @opennextjs/cloudflare, tailwindcss, @tailwindcss/postcss, @types/bcryptjs (+9 more)

### Community 9 - "settings/route.ts"
Cohesion: 0.14
Nodes (19): GET(), getSettings(), maskSensitiveValue(), PUT(), SENSITIVE_KEYS, SETTINGS_KEYS, SOCIAL_URL_KEYS, POST() (+11 more)

### Community 10 - "Prompt برای Claude — پروژه Insurance Recruit SaaS"
Cohesion: 0.04
Nodes (47): Admin Panel, Auto-provisioning, Central Updates, Custom Domain Support, Prompt برای Claude — پروژه Insurance Recruit SaaS, Tenant Isolation, الزامات فنی, انتخاب دیتابیس (+39 more)

### Community 12 - "adminFetch"
Cohesion: 0.18
Nodes (16): ChangePasswordPage(), handleSubmit(), ProfilePage(), handleSave(), handleUpload(), setField(), SettingsPage(), handleSave() (+8 more)

### Community 13 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

### Community 17 - "next.config.ts"
Cohesion: 0.50
Nodes (3): csp, nextConfig, securityHeaders

### Community 19 - "Security Changes Summary - Tavana Demo"
Cohesion: 0.07
Nodes (26): 1. 🔴 CRITICAL: Hardcoded SESSION_SECRET, 2. 🔴 CRITICAL: Weak Password in .env.local, 3. 🟡 MEDIUM: Session Persistence, 4. 🟡 MEDIUM: Demo Mode Isolation, 5. 🟢 LOW: Authentication Flexibility, Authentication, Authentication, Compliance Status (+18 more)

### Community 21 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native CLAUDE.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 23 - "راهنمای دموی حرفه‌ای — سیستم جذب نماینده بیمه"
Cohesion: 0.08
Nodes (23): اثبات اجتماعی (Social Proof), اجرای خودکار, اجرای دستی, اشتراک‌گذاری با گوشی, بهینه‌سازی سرعت, تخصص (Authority), تعامل (Commitment), راهنمای دموی حرفه‌ای — سیستم جذب نماینده بیمه (+15 more)

### Community 24 - "Security Documentation - Tavana Demo"
Cohesion: 0.09
Nodes (22): 1. Flexible Authentication (Task #1), 2. Session Volatility (Task #2), 3. Security Hardening & Demo Mode Isolation (Task #3), 4. Secret Removal (Task #4), Authentication Flow Summary, Changes Made:, Changes Made:, Changes Made: (+14 more)

### Community 26 - "راهنمای گردش‌کار: Graphify + مهندسی قوانین برای OpenCode"
Cohesion: 0.10
Nodes (19): آپدیت خودکار گراف, آیا الگوی بهتری برای CLAUDE.md/GEMINI.md هست؟, آیا برای پروژه‌های کوچیک هم لازمه؟, افزایش قدرت استدلال خام مدل‌های رایگان, برای استفاده آینده از Claude در VSCode, بهترین شیوه‌ی فعلی — آیا چیز بهتری هست؟, ترتیب دقیق استفاده — از کجا شروع کنم؟, راهنمای گردش‌کار: Graphify + مهندسی قوانین برای OpenCode (+11 more)

### Community 28 - "demo-client.tsx"
Cohesion: 0.11
Nodes (14): Applicant, DemoPageClient(), FaqItem, GrowthStage, Profile, SECTIONS, STATUS_MAP, SuccessEntry (+6 more)

### Community 29 - "applicant-filters.tsx"
Cohesion: 0.18
Nodes (11): saveAppointment(), toJalaliIso(), ApplicantFilters, APPOINTMENT_OPTIONS, FilterBar(), FilterBarProps, formatJalaliShort(), hasActiveFilters() (+3 more)

### Community 30 - "toPersianDigits"
Cohesion: 0.12
Nodes (13): StatPill(), AdminDateDisplay(), AdminNav(), ALL_ITEMS, Badge(), MOBILE_PRIMARY, MOBILE_PRIMARY_HREFS, NAV_GROUPS (+5 more)

### Community 31 - "growth-path/page.tsx"
Cohesion: 0.24
Nodes (12): ProfileData, Stage, agentCountScore(), calculateGrowthScore(), gradeFromScore(), growthPercentScore(), GrowthScoreInput, GrowthScoreResult (+4 more)

### Community 33 - "Insurance Recruit Template — وضعیت پروژه"
Cohesion: 0.13
Nodes (14): API Routes (۱۷ مسیر), Insurance Recruit Template — وضعیت پروژه, استقرار, 🔑 اطلاعات مهم, ✅ انجام شده, اولویت بالا, اولویت متوسط, اولویت پایین (+6 more)

### Community 34 - "AGENTS.md — Master Instructions for AI Coding Agents"
Cohesion: 0.14
Nodes (13): 0. Context Read Order (do this before writing any code), 1. Project Identity, 2. Non-Negotiable Rules, 3. Development Cycle, 4. Execution Preconditions, 5. Token Discipline, 6. Confidence Tags (from Graphify — applies only if Graphify: yes), 7. Multi-tool Compatibility (+5 more)

### Community 35 - "jalali-calendar.tsx"
Cohesion: 0.16
Nodes (15): JalaliDateInput(), handleDayClick(), nextMonth(), prevMonth(), FA_DIGITS, JalaliCalendar(), handleDayClick(), nextMonth() (+7 more)

### Community 36 - "SuccessWallPage"
Cohesion: 0.26
Nodes (9): SuccessWallPage(), addToast(), handleAdd(), handleDelete(), handleEdit(), handleImageUpload(), handleRemoveImage(), load() (+1 more)

### Community 37 - "walkthrough-client.tsx"
Cohesion: 0.18
Nodes (6): FaqItem, GrowthStage, Profile, SECTION_INFO, SuccessEntry, WalkthroughClient()

### Community 38 - "admin/page.tsx"
Cohesion: 0.08
Nodes (24): AdminDashboard(), handleDelete(), handleStatusChange(), Applicant, getScoreStyle(), INITIAL_FILTERS, SCORE_COLORS, useDebounce() (+16 more)

### Community 39 - "اجرا (۲ دقیقه قبل از شروع ارائه)"
Cohesion: 0.14
Nodes (13): اجرا (۲ دقیقه قبل از شروع ارائه), اطلاعات ورود به پنل مدیریت, اگه ارور داد, بعد از ارائه, راهنمای اجرای دمو — روز ارائه, سرعت, قدم ۱: VPN روشن کن, قدم ۲: فایل دیتابیس قبلی رو پاک کن (اختیاری) (+5 more)

### Community 40 - "updates/page.tsx"
Cohesion: 0.29
Nodes (5): isNewer(), ReleaseEntry, UpdateCenterInfo, UpdatesPage(), handleDeploy()

### Community 41 - "FaqPage"
Cohesion: 0.27
Nodes (7): FaqPage(), addToast(), handleAdd(), handleDelete(), handleEdit(), load(), saveOrder()

### Community 42 - "GrowthPathPage"
Cohesion: 0.27
Nodes (7): GrowthPathPage(), addToast(), handleAdd(), handleDelete(), handleEdit(), load(), saveOrder()

### Community 43 - "تغییرات قالب جذب نمایندگان بیمه"
Cohesion: 0.40
Nodes (4): [0.1.0] - 2026-07-24 — نسخه اولیه, [0.2.0] - 2026-08-31 — نقشه، زمان‌بندی نیم‌ساعته و موقعیت مکانی, [0.3.0] - 2026-08-31 — بازطراحی تم روشن و تاریک با استاندارد WCAG, تغییرات قالب جذب نمایندگان بیمه

### Community 44 - "run-seed.ts"
Cohesion: 0.17
Nodes (10): cleanSql, DATA_DIR, db, DB_PATH, schema, scoreRows, seedSql, statements (+2 more)

### Community 46 - "GRAPHIFY-CHECKLIST-fa.md — چک‌لیست دستورات، فقط برای پروژه‌های بزرگ"
Cohesion: 0.22
Nodes (8): GRAPHIFY-CHECKLIST-fa.md — چک‌لیست دستورات، فقط برای پروژه‌های بزرگ, ۱. نصب (یک‌بار روی این ماشین), ۲. ثبت پلتفرم (یک‌بار روی این پروژه), ۳. فعال‌سازی همیشگی (یک‌بار روی این پروژه), ۴. خودکارسازی آپدیت (یک‌بار روی این پروژه، خیلی توصیه می‌شه), ۵. ساخت اولین گراف (بعد از این که کد اولیه از فاز Scaffold ساخته شد), ۶. کار روزمره — هیچی دستی نیست, ۷. (اختیاری) اگه بعداً Claude Code هم اضافه کردی

### Community 47 - "PHASE-PROMPTS-fa.md — پرامپت‌های آماده برای هر فاز"
Cohesion: 0.22
Nodes (8): PHASE-PROMPTS-fa.md — پرامپت‌های آماده برای هر فاز, فاز ۰ — مصاحبه (تکمیل edge.md و design.md), فاز ۱ — Scaffold (ساخت زیرساخت اولیه), فاز ۲ — API Layer, فاز ۳ — Hooks (منطق اشتراکی), فاز ۴ — Components (رابط کاربری), فاز ۵ — Polish (نهایی‌سازی), نکته برای پروژه‌های کوچیک

### Community 48 - "package.json"
Cohesion: 0.22
Nodes (8): @libsql/client, bcryptjs, name, optionalDependencies, bcryptjs, @libsql/client, private, version

### Community 49 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 50 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, build, cf:build, cf:deploy, cf:dev, changelog, dev, lint (+3 more)

### Community 51 - "LocationPage"
Cohesion: 0.46
Nodes (6): isValidLat(), isValidLng(), LocationPage(), applyParsed(), handleSave(), parseCoords()

### Community 52 - "راهنمای حالت دمو"
Cohesion: 0.25
Nodes (7): تفاوت حالت عادی و دمو, حالت دمو چیست؟, راهنمای حالت دمو, روش خودکار (توصیه شده), روش دستی, لینک‌های مهم, نحوه فعال‌سازی

### Community 53 - "COMMANDS-fa.md — چیت‌شیت دستورات (کی، کجا، چرا)"
Cohesion: 0.25
Nodes (7): COMMANDS-fa.md — چیت‌شیت دستورات (کی، کجا، چرا), خلاصه یک‌خطی, خودکارسازی کامل آپدیت گراف, دستوراتی که فقط برای پرسیدن سوالن (هروقت خواستی), روزمره (و چطور خودکارش کنیم), کجا تایپ می‌شه؟, یک‌بار برای همیشه (نصب)

### Community 55 - "design.md"
Cohesion: 0.29
Nodes (6): 1. Direction & Layout, 2. Typography, 3. Color Tokens, 4. Component Patterns, 5. Do-Not-Change List, 6. Verification Checklist

### Community 56 - "roadmap.md"
Cohesion: 0.29
Nodes (6): Phase 1: Static homepage content, Phase 2: Agent application form + storage, Phase 3: Telegram integration + automatic scoring, Phase 4: Agent referral links, Phase 5: Initial sales-fit assessment (optional), Phase 6: Admin panel + Persian calendar

### Community 57 - "edge.md"
Cohesion: 0.33
Nodes (5): 1. Business Logic, 2. Architecture — Locked Decisions, 3. Data Model Constraints, 4. Hard Boundaries, 5. Out of Scope (for now)

### Community 58 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 59 - "prompts/scaffold.md — Scaffold Phase"
Cohesion: 0.33
Nodes (5): After this phase, Do, Don't, Preconditions, prompts/scaffold.md — Scaffold Phase

### Community 60 - "سایت اختصاصی مدیر فروش بیمه عمر"
Cohesion: 0.33
Nodes (5): دستورات مفید, راه‌اندازی, سایت اختصاصی مدیر فروش بیمه عمر, نکته درباره better-sqlite3, وضعیت فعلی (طبق roadmap.md)

### Community 64 - "prompts/escalate.md — Escalation Protocol"
Cohesion: 0.40
Nodes (4): prompts/escalate.md — Escalation Protocol, Stop and escalate when ANY of these are true, Template for the escalation prompt (fill in, then show it to the user verbatim), What to do when a trigger fires

### Community 65 - "prompts/polish.md — Polish Phase"
Cohesion: 0.40
Nodes (4): Do, Don't, Output, prompts/polish.md — Polish Phase

### Community 66 - "prompts/setup-interview.md — Phase 0: Interview & Draft"
Cohesion: 0.40
Nodes (4): Don't, prompts/setup-interview.md — Phase 0: Interview & Draft, Step 0 — Project Size Check (do this FIRST, before anything else), Step 1 — Interview & Draft

### Community 67 - "ensureSchema"
Cohesion: 0.05
Nodes (96): DELETE(), GET(), PATCH(), SortField, VALID_SORT, VALID_STATUSES, GET(), DELETE() (+88 more)

### Community 68 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 69 - "graphify reference: commit hook and native CLAUDE.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native CLAUDE.md integration, graphify reference: commit hook and native CLAUDE.md integration

### Community 70 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 71 - "set_pw.js"
Cohesion: 0.50
Nodes (3): bcrypt, { DatabaseSync }, db

### Community 92 - "update-center.ts"
Cohesion: 0.33
Nodes (8): GET(), clamp(), compareVersions(), fetchRemoteReleases(), getCurrentVersion(), isNewerVersion(), ReleaseEntry, UpdateCenterInfo

### Community 93 - "app/layout.tsx"
Cohesion: 0.50
Nodes (4): isDemoMode(), metadata, RootLayout(), vazirmatn

## Knowledge Gaps
- **443 isolated node(s):** `$schema`, `.opencode/plugins/graphify.js`, `FaqItem`, `Stage`, `ProfileData` (+438 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 553 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **16 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `adminFetch()` connect `adminFetch` to `update-bell.tsx`, `SuccessWallPage`, `api-client.ts`, `admin/page.tsx`, `updates/page.tsx`, `FaqPage`, `GrowthPathPage`, `LocationPage`, `applicant-filters.tsx`, `toPersianDigits`, `growth-path/page.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `ensureSchema()` connect `ensureSchema` to `settings/route.ts`, `applications/route.ts`, `app/page.tsx`, `auth.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `ThemeToggle()` connect `app/page.tsx` to `toPersianDigits`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **What connects `$schema`, `.opencode/plugins/graphify.js`, `FaqItem` to the rest of the system?**
  _443 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `jalali.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Should `applications/route.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.07087486157253599 - nodes in this community are weakly interconnected._
- **Should `app/page.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.053939714436805924 - nodes in this community are weakly interconnected._