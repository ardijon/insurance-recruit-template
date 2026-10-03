// Single DDL source for the D1, Turso and local backends in lib/db.ts (plus build/seed scripts).
export const SCHEMA_STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS manager_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        name TEXT NOT NULL DEFAULT '',
        title TEXT NOT NULL DEFAULT '',
        position_code TEXT NOT NULL DEFAULT '',
        position_start_date TEXT NOT NULL DEFAULT '',
        bio TEXT NOT NULL DEFAULT '',
        achievements TEXT NOT NULL DEFAULT '',
        current_agent_count INTEGER NOT NULL DEFAULT 0,
        growth_agents_6m INTEGER,
        growth_agents_1y INTEGER,
        growth_agents_2y INTEGER,
        growth_policies_6m INTEGER,
        growth_policies_1y INTEGER,
        growth_policies_2y INTEGER,
        site_theme TEXT NOT NULL DEFAULT 'warm',
        photo_url TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  `CREATE TABLE IF NOT EXISTS success_wall_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        quote TEXT NOT NULL,
        images_json TEXT NOT NULL DEFAULT '[]',
        permission_granted INTEGER NOT NULL DEFAULT 0,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  `CREATE TABLE IF NOT EXISTS growth_path_stages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sort_order INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL
      )`,
  `CREATE TABLE IF NOT EXISTS faq_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        question TEXT NOT NULL,
        answer TEXT NOT NULL
      )`,
  `CREATE TABLE IF NOT EXISTS referral_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agent_name TEXT NOT NULL,
        code TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  `CREATE TABLE IF NOT EXISTS applicants (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT,
        sales_background TEXT,
        network_size TEXT,
        availability TEXT,
        motivation TEXT,
        score INTEGER,
        referral_code TEXT REFERENCES referral_links(code),
        appointment_date TEXT,
        appointment_jalali TEXT,
        appointment_time TEXT,
        telegram_notified_at TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  `CREATE TABLE IF NOT EXISTS fit_assessment_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        applicant_id INTEGER NOT NULL REFERENCES applicants(id),
        answers_json TEXT NOT NULL,
        summary TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  `CREATE TABLE IF NOT EXISTS success_visual_story (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        images_json TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  `CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  `CREATE TABLE IF NOT EXISTS rate_limit (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 0,
        reset_at INTEGER NOT NULL DEFAULT 0
      )`,
  `CREATE TABLE IF NOT EXISTS uploads (
        key TEXT PRIMARY KEY,
        data TEXT NOT NULL,
        mime TEXT NOT NULL DEFAULT 'image/jpeg',
        size INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      )`,
  // UNIQUE on phone is enforced via index (not inline) so pre-existing
  // tables created without it still gain the constraint on next boot.
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_applicants_phone ON applicants(phone)`,
  `CREATE INDEX IF NOT EXISTS idx_success_wall_permission ON success_wall_entries(permission_granted)`,
  `CREATE INDEX IF NOT EXISTS idx_success_wall_sort_order ON success_wall_entries(sort_order)`,
  `CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status)`,
  `CREATE INDEX IF NOT EXISTS idx_applicants_score ON applicants(score)`,
  `CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON applicants(created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_applicants_city ON applicants(city)`,
  `CREATE INDEX IF NOT EXISTS idx_applicants_appointment_date ON applicants(appointment_date)`,
  `CREATE INDEX IF NOT EXISTS idx_applicants_appointment_jalali ON applicants(appointment_jalali)`,
  `CREATE INDEX IF NOT EXISTS idx_fit_assessment_applicant ON fit_assessment_results(applicant_id)`,
  // Singleton rows: UPDATE ... WHERE id = 1 silently affects 0 rows when
  // the row is missing (fresh production DBs), so ensure it exists here.
  `INSERT INTO manager_profile (id) VALUES (1) ON CONFLICT(id) DO NOTHING`,
  `INSERT INTO success_visual_story (id) VALUES (1) ON CONFLICT(id) DO NOTHING`,
];
