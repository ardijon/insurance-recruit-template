// lib/seed.ts
//
// Populates default data for a fresh deployment.
// Uses the unified async db layer (works with both Turso and local SQLite).

import { selectOne, executeInsert } from "@/lib/db";

export async function seedIfEmpty(): Promise<void> {
  const profileCount = await selectOne(
    "SELECT COUNT(*) AS c FROM manager_profile"
  ) as { c: number };

  if (profileCount.c === 0) {
    await executeInsert(
      `INSERT INTO manager_profile (id, name, title, position_code, position_start_date, bio, achievements, current_agent_count,
        growth_agents_6m, growth_agents_1y, growth_agents_2y, growth_policies_6m, growth_policies_1y, growth_policies_2y)
       VALUES (1, 'حمید رضایی', 'مدیر فروش ارشد', 'MGR-001', '1402/03/15',
        'بیش از ۱۰ سال تجربه در حوزه بیمه عمر و سرمایه‌گذاری. تخصص اصلی: جذب و آموزش نمایندگان حرفه‌ای. موفق به تشکیل تیمی بالغ بر ۵۰ نماینده فعال در سراسر کشور.',
        '["کسب عنوان مدیر فروش برتر کشوری در سال ۱۴۰۳","رشد ۲۰۰ درصدی تیم فروش طی ۲ سال","بیش از ۵۰۰ بیمه‌نامه صادر شده در سال گذشته","دریافت تندیس طلایی نمایندگی برتر"]',
        47, 25, 60, 120, 35, 85, 200)`
    );
  }

  const wallCount = await selectOne(
    "SELECT COUNT(*) AS c FROM success_wall_entries"
  ) as { c: number };

  if (wallCount.c === 0) {
    await executeInsert(
      "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)",
      ["علی محمدی", "از وقتی وارد تیم آقای رضایی شدم، درآمدم سه برابر شده. آموزش‌های حرفه‌ای و پشتیبانی مداوم، رمز موفقیته.", 1]
    );
    await executeInsert(
      "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)",
      ["سارا احمدی", "بهترین تصمیم زندگی‌ام بود که به این تیم پیوستم. محیط کاری صمیمی و پر از انرژی مثبت.", 2]
    );
    await executeInsert(
      "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)",
      ["رضا کریمی", "با صفر سابقه شروع کردم، الان ماهیانه بیش از ۵۰ میلیون درآمد دارم. از مدیرم ممنونم.", 3]
    );
    await executeInsert(
      "INSERT INTO success_wall_entries (agent_name, quote, permission_granted, sort_order) VALUES (?, ?, 1, ?)",
      ["نیلوفر حسینی", "عدم نیاز به سرمایه اولیه و آموزش‌های رایگان باعث شد بدون ریسک شروع کنم.", 4]
    );
  }

  const growthCount = await selectOne(
    "SELECT COUNT(*) AS c FROM growth_path_stages"
  ) as { c: number };

  if (growthCount.c === 0) {
    await executeInsert(
      "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)",
      ["بازاریاب", "دوره آموزشی جامع و آشنایی کامل با محصولات بیمه عمر، پس‌انداز و سرمایه‌گذاری", 1]
    );
    await executeInsert(
      "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)",
      ["نماینده فعال", "شروع فروش مستقل، ایجاد شبکه ارتباطی قوی و جذب مشتریان وفادار", 2]
    );
    await executeInsert(
      "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)",
      ["راهنمای فروش", "افزایش حجم فروش، آموزش و mentorship نمایندگان تازه‌وارد", 3]
    );
    await executeInsert(
      "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)",
      ["مدیر فروش", "جذب و مدیریت تیم فروش، درآمد پایدار از زیرمجموعه و پاداش‌های ویژه", 4]
    );
    await executeInsert(
      "INSERT INTO growth_path_stages (title, description, sort_order) VALUES (?, ?, ?)",
      ["مدیر ارشد فروش", "هدایت چند تیم فروش، دریافت سهام شرکت و سفرهای خارجی انگیزشی", 5]
    );
  }

  const faqCount = await selectOne(
    "SELECT COUNT(*) AS c FROM faq_items"
  ) as { c: number };

  if (faqCount.c === 0) {
    await executeInsert(
      "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)",
      ["آیا برای شروع کار نیاز به سابقه فروش دارم؟", "خیر، اصلاً نیازی به سابقه فروش نیست. دوره‌های آموزشی جامع و رایگان برای همه نمایندگان جدید برگزار می‌شود و تا زمانی که به درآمد برسید، کنارتان هستیم.", 1]
    );
    await executeInsert(
      "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)",
      ["چه مدت طول می‌کشد تا نماینده شوم؟", "پس از ثبت درخواست و مصاحبه حضوری، فرآیند آموزشی حدود ۱۰ روز کاری طول می‌کشد. بعد از امتحان پایان دوره، مجوز رسمی نمایندگی دریافت می‌کنید.", 2]
    );
    await executeInsert(
      "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)",
      ["آیا امکان همکاری پاره‌وقت وجود دارد؟", "بله، همکاری به صورت تمام‌وقت و پاره‌وقت امکان‌پذیر است. بسیاری از نمایندگان ما در کنار شغل اصلی‌شان فعالیت می‌کنند.", 3]
    );
    await executeInsert(
      "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)",
      ["درآمد ماهیانه یک نماینده چقدر است؟", "بسته به سطح فروش و تعداد بیمه‌نامه‌های صادر شده، درآمد ماهیانه از ۲۰ میلیون تومان شروع می‌شود و بدون سقف ادامه دارد. نمایندگان برتر ما ماهیانه بالای ۱۰۰ میلیون درآمد دارند.", 4]
    );
    await executeInsert(
      "INSERT INTO faq_items (question, answer, sort_order) VALUES (?, ?, ?)",
      ["آیا نیاز به سرمایه اولیه دارم؟", "خیر، هیچ سرمایه اولیهای نیاز نیست. فقط کافیست وقت و انرژی بگذارید و آموزشها را جدی بگیرید.", 5]
    );
  }

  const applicantCount = await selectOne(
    "SELECT COUNT(*) AS c FROM applicants"
  ) as { c: number };

  if (applicantCount.c === 0) {
    // Sample applicants using the NEW structured format so the demo matches
    // the live application form. sales_background holds the structured answers
    // as JSON; score is precomputed with the same weighted model.
    const samples: {
      full_name: string; phone: string; city: string;
      sales: { sales_experience: number; sales_result: number; leadership: number };
      network: string; availability: string; motivation: string;
      score: number; status: string;
    }[] = [
      { full_name: "حسین رجبی", phone: "09121234567", city: "تهران", sales: { sales_experience: 5, sales_result: 5, leadership: 4 }, network: "4", availability: "3", motivation: "میخوام در حوزهای فعالیت کنم که هم درآمد بالاتری داشته باشم و هم به مردم کمک کنم.", score: 95, status: "interviewed" },
      { full_name: "امیر سلطانی", phone: "09198765432", city: "شیراز", sales: { sales_experience: 5, sales_result: 5, leadership: 5 }, network: "4", availability: "3", motivation: "با سابقه طولانی در بیمه میخوام در محیط حرفهایتری فعالیت کنم.", score: 92, status: "hired" },
      { full_name: "زهرا کاظمی", phone: "09367788990", city: "مشهد", sales: { sales_experience: 4, sales_result: 4, leadership: 3 }, network: "4", availability: "3", motivation: "تجربه فروش دارم و میتونم سریع نتیجه بگیرم.", score: 78, status: "interviewed" },
      { full_name: "مریم اکبری", phone: "09011223344", city: "تبریز", sales: { sales_experience: 2, sales_result: 2, leadership: 1 }, network: "3", availability: "2", motivation: "در کنار فروشگاهم میخوام درآمد دیگری داشته باشم.", score: 45, status: "contacted" },
      { full_name: "رضا حیدری", phone: "09223344556", city: "تهران", sales: { sales_experience: 1, sales_result: 1, leadership: 1 }, network: "2", availability: "2", motivation: "میخوام درآمد غیرفعال داشته باشم.", score: 28, status: "new" },
      { full_name: "سارا بهرامی", phone: "09189900112", city: "کرمان", sales: { sales_experience: 1, sales_result: 1, leadership: 1 }, network: "2", availability: "2", motivation: "معلم هستم و میخوام درآمدم رو افزایش بدم.", score: 35, status: "rejected" },
    ];

    for (const s of samples) {
      await executeInsert(
        `INSERT INTO applicants
          (full_name, phone, city, sales_background, network_size, availability, motivation, score, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', '-' || (abs(random()) % 30) || ' days'))`,
        [
          s.full_name, s.phone, s.city,
          JSON.stringify(s.sales), s.network, s.availability, s.motivation,
          s.score, s.status,
        ]
      );
    }
  }
}
