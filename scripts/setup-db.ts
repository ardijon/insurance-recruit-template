import { createClient } from "@libsql/client";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.log("No TURSO_DATABASE_URL, skipping setup");
    return;
  }

  console.log("Setting up Turso database...");
  const client = createClient({ url, authToken: token });

  await client.executeMultiple(`
    CREATE TABLE IF NOT EXISTS manager_profile (
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
    );
    CREATE TABLE IF NOT EXISTS success_wall_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_name TEXT NOT NULL,
      quote TEXT NOT NULL,
      images_json TEXT NOT NULL DEFAULT '[]',
      permission_granted INTEGER NOT NULL DEFAULT 0,
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
      full_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT,
      sales_background TEXT,
      network_size TEXT,
      availability TEXT,
      motivation TEXT,
      score INTEGER,
      referral_code TEXT,
      appointment_date TEXT,
      appointment_time TEXT,
      telegram_notified_at TEXT,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS fit_assessment_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      applicant_id INTEGER NOT NULL,
      answers_json TEXT NOT NULL,
      summary TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS success_visual_story (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      images_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const profileCount = await client.execute("SELECT COUNT(*) AS c FROM manager_profile");
  if (Number(profileCount.rows[0].c) === 0) {
    console.log("Seeding default data...");
    await client.execute({
      sql: "INSERT INTO manager_profile (id, name, title, position_code, position_start_date, bio, achievements, current_agent_count, growth_agents_6m, growth_agents_1y, growth_agents_2y, growth_policies_6m, growth_policies_1y, growth_policies_2y) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      args: ['حمید رضایی', 'مدیر فروش ارشد', 'MGR-001', '1402/03/15', 'بیش از ۱۰ سال تجربه.', '["مدیر فروش برتر"]', 47, 25, 60, 120, 35, 85, 200]
    });
    await client.execute({ sql: "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)", args: ["علی محمدی", "درآمدم سه برابر شده.", 1] });
    await client.execute({ sql: "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", args: ["بازاریاب", "آشنایی با محصولات بیمه عمر", 1] });
    await client.execute({ sql: "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", args: ["نماینده فعال", "جذب مشتریان جدید", 2] });
    await client.execute({ sql: "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", args: ["مدیر فروش", "مدیریت تیم فروش", 3] });
    await client.execute({ sql: "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)", args: ["آیا نیاز به سابقه فروش دارم؟", "خیر، آموزش رایگان است.", 1] });
  }

  console.log("Database setup complete!");
}

main().catch(console.error);
فایل ۲: lib/seed.ts — کل محتوا رو جایگزین کن:
import { selectOne, executeInsert } from "@/lib/db";

export async function seedIfEmpty(): Promise<void> {
  const profileCount = await selectOne("SELECT COUNT(*) AS c FROM manager_profile") as { c: number };

  if (profileCount.c === 0) {
    await executeInsert(
      `INSERT INTO manager_profile (id, name, title, position_code, position_start_date, bio, achievements, current_agent_count,
        growth_agents_6m, growth_agents_1y, growth_agents_2y, growth_policies_6m, growth_policies_1y, growth_policies_2y)
       VALUES (1, 'حمید رضایی', 'مدیر فروش ارشد', 'MGR-001', '1402/03/15',
        'بیش از ۱۰ سال تجربه در حوزه بیمه عمر و سرمایه‌گذاری.',
        '["کسب عنوان مدیر فروش برتر"]',
        47, 25, 60, 120, 35, 85, 200)`
    );
  }

  const wallCount = await selectOne("SELECT COUNT(*) AS c FROM success_wall_entries") as { c: number };
  if (wallCount.c === 0) {
    await executeInsert("INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)", ["علی محمدی", "از وقتی وارد تیم شدم درآمدم سه برابر شده.", 1]);
    await executeInsert("INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)", ["سارا احمدی", "بهترین تصمیم زندگی‌ام بود.", 2]);
    await executeInsert("INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)", ["رضا کریمی", "با صفر سابقه شروع کردم، الان ماهی ۵۰ میلیون درآمد دارم.", 3]);
  }

  const growthCount = await selectOne("SELECT COUNT(*) AS c FROM growth_path_stages") as { c: number };
  if (growthCount.c === 0) {
    await executeInsert("INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", ["بازاریاب", "دوره آموزشی و آشنایی با محصولات بیمه عمر", 1]);
    await executeInsert("INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", ["نماینده فعال", "ایجاد شبکه ارتباطی و جذب مشتریان جدید", 2]);
    await executeInsert("INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", ["مدیر فروش", "جذب و مدیریت تیم فروش", 3]);
  }

  const faqCount = await selectOne("SELECT COUNT(*) AS c FROM faq_items") as { c: number };
  if (faqCount.c === 0) {
    await executeInsert("INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)", ["آیا نیاز به سابقه فروش دارم؟", "خیر، آموزش رایگان است.", 1]);
    await executeInsert("INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)", ["چه مدت طول می‌کشد؟", "حدود ۱۰ روز کاری", 2]);
  }
}
