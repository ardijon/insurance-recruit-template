# Graph Report - D:\New Projects\Insurance\manager  (2026-07-24)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 301 nodes · 469 edges · 19 communities (14 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- getDb
- jalali-calendar.tsx
- application-form.tsx
- app/page.tsx
- compilerOptions
- admin/page.tsx
- auth.ts
- package.json
- devDependencies
- theme-toggle.tsx
- scoring.ts
- schema.sql
- profile/page.tsx
- opencode.json
- graphify.js
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs

## God Nodes (most connected - your core abstractions)
1. `getDb()` - 39 edges
2. `compilerOptions` - 16 edges
3. `toPersianDigits()` - 10 edges
4. `JalaliCalendar()` - 9 edges
5. `include` - 7 edges
6. `verifySessionValue()` - 7 edges
7. `gregorianToJalali()` - 7 edges
8. `formatJalali()` - 7 edges
9. `AdminDashboard()` - 6 edges
10. `Toast` - 6 edges

## Surprising Connections (you probably didn't know these)
- `HomePage()` --calls--> `getDb()`  [EXTRACTED]
  app/page.tsx → lib/db.ts
- `GET()` --calls--> `getDb()`  [EXTRACTED]
  app/api/admin/applicants/route.ts → lib/db.ts
- `PATCH()` --calls--> `getDb()`  [EXTRACTED]
  app/api/admin/applicants/route.ts → lib/db.ts
- `GET()` --calls--> `getDb()`  [EXTRACTED]
  app/api/admin/faq/route.ts → lib/db.ts
- `POST()` --calls--> `getDb()`  [EXTRACTED]
  app/api/admin/faq/route.ts → lib/db.ts

## Import Cycles
- None detected.

## Communities (19 total, 5 thin omitted)

### Community 0 - "getDb"
Cohesion: 0.08
Nodes (34): GET(), PATCH(), DELETE(), GET(), PATCH(), POST(), PUT(), DELETE() (+26 more)

### Community 1 - "jalali-calendar.tsx"
Cohesion: 0.12
Nodes (27): AdminDashboard(), todayJalaliStr(), AdminDateDisplay(), AdminNav(), NAV_ITEMS, dateFromIso(), isJalaliLeapYear(), JalaliCalendar() (+19 more)

### Community 2 - "application-form.tsx"
Cohesion: 0.10
Nodes (27): POST(), ApplicationForm(), StepErrors, STEPS, useReferral(), computeFitResult(), FitAnswers, FitQuestion (+19 more)

### Community 3 - "app/page.tsx"
Cohesion: 0.11
Nodes (23): HomePage(), AnimateOnShow(), FaqItem, FaqSection(), Footer(), GrowthPath(), GrowthPathStage, STAGE_ICONS (+15 more)

### Community 4 - "compilerOptions"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 5 - "admin/page.tsx"
Cohesion: 0.17
Nodes (8): FaqItem, Stage, Applicant, getScoreStyle(), SCORE_COLORS, Entry, ToastContainer(), Toast

### Community 6 - "auth.ts"
Cohesion: 0.17
Nodes (12): POST(), GET(), POST(), base64url(), base64urlDecode(), createSessionValue(), encode(), NOTE: single-admin authentication — edge.md §2 locks "Only admin access (+4 more)

### Community 7 - "package.json"
Cohesion: 0.10
Nodes (19): next, @next/swc-win32-x64-msvc, dependencies, next, @next/swc-win32-x64-msvc, react, react-dom, zod (+11 more)

### Community 8 - "devDependencies"
Cohesion: 0.12
Nodes (17): eslint, eslint-config-next, devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node (+9 more)

### Community 9 - "theme-toggle.tsx"
Cohesion: 0.23
Nodes (7): Header(), NAV_ITEMS, MoonIcon(), SunIcon(), ThemeToggle(), NOTE: pairs with the blocking script in app/layout.tsx (same localStorage key, useTheme()

### Community 10 - "scoring.ts"
Cohesion: 0.31
Nodes (10): ApplicantScoringInput, ARABIC_DIGITS, computeBreakdown(), extractFirstNumber(), normalizeDigits(), PERSIAN_DIGITS, scoreAvailability(), ScoreBreakdown (+2 more)

### Community 11 - "schema.sql"
Cohesion: 0.32
Nodes (7): applicants, faq_items, fit_assessment_results, growth_path_stages, manager_profile, referral_links, success_wall_entries

### Community 13 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **85 isolated node(s):** `eslintConfig`, `manager_profile`, `success_wall_entries`, `growth_path_stages`, `faq_items` (+80 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getDb()` connect `getDb` to `application-form.tsx`, `app/page.tsx`?**
  _High betweenness centrality (0.136) - this node is a cross-community bridge._
- **Why does `ThemeToggle()` connect `theme-toggle.tsx` to `jalali-calendar.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `toPersianDigits()` connect `jalali-calendar.tsx` to `admin/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **What connects `eslintConfig`, `manager_profile`, `success_wall_entries` to the rest of the system?**
  _85 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `getDb` be split into smaller, more focused modules?**
  _Cohesion score 0.08181818181818182 - nodes in this community are weakly interconnected._
- **Should `jalali-calendar.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Should `application-form.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.10227272727272728 - nodes in this community are weakly interconnected._