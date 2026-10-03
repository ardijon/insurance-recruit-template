// scripts/setup-db.ts
// Creates tables in Turso database at build time
import { createClient } from "@libsql/client";
import { SCHEMA_STATEMENTS } from "../lib/schema";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const token = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.log("No TURSO_DATABASE_URL, skipping setup (using local SQLite)");
    return;
  }

  console.log("Setting up Turso database...");
  const client = createClient({ url, authToken: token });

  await client.executeMultiple(
    `${SCHEMA_STATEMENTS.filter((s) => !s.startsWith("INSERT INTO")).join(";\n")};`
  );

  // Seed default data
  const profileCount = await client.execute("SELECT COUNT(*) AS c FROM manager_profile");
  if (Number(profileCount.rows[0].c) === 0) {
    console.log("Seeding default data...");
    await client.execute({
      sql: `INSERT INTO manager_profile (id, name, title, position_code, position_start_date, bio, achievements, current_agent_count,
        growth_agents_6m, growth_agents_1y, growth_agents_2y, growth_policies_6m, growth_policies_1y, growth_policies_2y)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: ['حمید رضایی', 'مدیر فروش ارشد', 'MGR-001', '1402/03/15',
        'بیش از ۱۰ سال تجربه در حوزه بیمه عمر و سرمایه‌گذاری.',
        '["مدیر فروش برتر"]',
        47, 25, 60, 120, 35, 85, 200]
    });

    await client.execute({ sql: "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)", args: ["علی محمدی", "از وقتی وارد تیم شدم درآمدم سه برابر شده.", 1] });
    await client.execute({ sql: "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)", args: ["سارا احمدی", "بهترین تصمیم زندگی‌ام بود.", 2] });
    await client.execute({ sql: "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)", args: ["رضا کریمی", "با صفر سابقه شروع کردم، الان ماهی ۵۰ میلیون درآمد دارم.", 3] });

    await client.execute({ sql: "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", args: ["بازاریاب", "دوره آموزشی و آشنایی با محصولات بیمه عمر", 1] });
    await client.execute({ sql: "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", args: ["نماینده فعال", "ایجاد شبکه ارتباطی و جذب مشتریان جدید", 2] });
    await client.execute({ sql: "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", args: ["راهنمای فروش", "افزایش فروش و آموزش نمایندگان جدید", 3] });
    await client.execute({ sql: "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)", args: ["مدیر فروش", "جذب و مدیریت تیم فروش", 4] });

    await client.execute({ sql: "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)", args: ["آیا نیاز به سابقه فروش دارم؟", "خیر، دوره‌های آموزشی رایگان برگزار می‌شود.", 1] });
    await client.execute({ sql: "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)", args: ["چه مدت طول می‌کشد؟", "حدود ۱۰ روز کاری", 2] });
    await client.execute({ sql: "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)", args: ["آیا امکان همکاری پاره‌وقت هست؟", "بله، امکان‌پذیر است.", 3] });
  }

  console.log("Database setup complete!");
}

main().catch(console.error);
