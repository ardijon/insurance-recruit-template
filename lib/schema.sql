-- lib/schema.sql
--
-- NOTE: one SQLite file per deployment (see edge.md §1, §2, §4 — this project
-- is a reusable template, never a shared multi-tenant backend). This schema
-- is applied once, on first run, by lib/db.ts.
--
-- WHY SQLite: no separate database service to provision, and hosting varies
-- per customer (edge.md §2 — Database row).

CREATE TABLE IF NOT EXISTS manager_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- single row by design: one manager per deployment
  name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '', -- سمت مدیریتی، زیر اسم در صفحه اصلی نمایش داده می‌شود
  position_code TEXT NOT NULL DEFAULT '', -- کد سمت مدیریتی
  position_start_date TEXT NOT NULL DEFAULT '', -- تاریخ شروع فعالیت در سمت جدید
  bio TEXT NOT NULL DEFAULT '',
  achievements TEXT NOT NULL DEFAULT '', -- free text / markdown, rendered in Components phase
  current_agent_count INTEGER NOT NULL DEFAULT 0,
  growth_agents_6m INTEGER,  --٪ رشد نمایندگان شش ماه اخیر (دستی)
  growth_agents_1y INTEGER,  --٪ رشد نمایندگان یک سال گذشته (دستی)
  growth_agents_2y INTEGER,  --٪ رشد نمایندگان دو سال گذشته (دستی)
  growth_policies_6m INTEGER, --٪ رشد بیمه‌نامه شش ماه اخیر (دستی)
  growth_policies_1y INTEGER, --٪ رشد بیمه‌نامه یک سال گذشته (دستی)
  growth_policies_2y INTEGER, --٪ رشد بیمه‌نامه دو سال گذشته (دستی)
  site_theme TEXT NOT NULL DEFAULT 'warm', -- 'warm' | 'dark' — chosen by manager in admin panel
  photo_url TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS success_wall_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name TEXT NOT NULL,
  quote TEXT NOT NULL,
  images_json TEXT NOT NULL DEFAULT '[]', -- JSON array of image URLs
  permission_granted INTEGER NOT NULL DEFAULT 0, -- 0/1 — hard boundary: never render if 0 (edge.md §4)
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS growth_path_stages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS faq_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  question TEXT NOT NULL,
  answer TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS referral_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agent_name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS applicants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  -- step 1: basic info
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  city TEXT,
  -- step 2: background
  sales_background TEXT,
  network_size TEXT,
  availability TEXT,
  -- step 3: motivation
  motivation TEXT,
  -- scoring — NULL until Phase 3 (scoring.ts) runs; never invent a score here
  score INTEGER,
  -- referral attribution — NULL when the applicant did not arrive via a link
  referral_code TEXT REFERENCES referral_links(code),
  -- appointment scheduling
  appointment_date TEXT,
  appointment_time TEXT,

  -- Phase 3 delivery state, so a failed Telegram send can be retried/inspected
  telegram_notified_at TEXT,
  -- status tracking: new | contacted | interviewed | hired | rejected
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Phase 5 (optional plugin) — kept separate from applicants so the core
-- funnel works with or without it (edge.md §5: deep/formal version is out
-- of scope; this table is only for the short, informal version).
CREATE TABLE IF NOT EXISTS fit_assessment_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id INTEGER NOT NULL REFERENCES applicants(id),
  answers_json TEXT NOT NULL,
  summary TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS success_visual_story (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  images_json TEXT NOT NULL DEFAULT '[]',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
