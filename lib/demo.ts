// lib/demo-mode.js
//
// لایه‌ی دمو: به‌جای بازنویسی کامپوننت‌ها، همون کامپوننت‌ها و همون UI واقعی
// باقی می‌مونن و فقط منبع داده عوض می‌شه. هیچ چیزی در دیتابیس واقعی نوشته نمی‌شه.
//
// نکته‌ی مهم: mutation ها فقط در sessionStorage مرورگر بازدیدکننده ذخیره می‌شن.
// یعنی اگه ۵ نفر همزمان دمو رو باز کنن، تغییرات هرکدوم فقط توی تب خودشونه.
// با رفرش یا دکمه‌ی «بازنشانی دمو» داده به حالت اولیه برمی‌گرده.

import mockData from "./mockApplicants.json";

export function isDemoMode(): boolean {
  const isProduction = process.env.NODE_ENV === "production";
  const demoMode = process.env.DEMO_MODE === "true";

  if (isProduction) {
    // Check if this is a demo deployment (Cloudflare Workers)
    const isDemoSite = !!(
      process.env.DEMO_MODE === "true"                             // Cloudflare Workers (wrangler.toml [vars])
    );
    return demoMode && isDemoSite;
  }

  return demoMode;
}

const STORAGE_KEY = "tavana_demo_applicants_v1";

// --- مدیریت کپی کاری در sessionStorage (فقط سمت کلاینت) ---

function loadWorkingCopy(): typeof mockData {
  if (typeof window === "undefined") {
    return structuredClone(mockData);
  }
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // اگه داده خراب بود، برگرد به نسخه‌ی اصلی
    }
  }
  const fresh = structuredClone(mockData);
  saveWorkingCopy(fresh);
  return fresh;
}

function saveWorkingCopy(list: typeof mockData) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function resetDemoData() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}

// --- خواندن داده (جایگزین fetch واقعی از API/Turso) ---

interface DemoFilters {
  search?: string;
  status?: string;
  city?: string;
  hasAppointment?: string;
  scoreMin?: string;
  scoreMax?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: number;
  limit?: number;
}

export function getDemoApplicants(filters: DemoFilters = {}) {
  const list = loadWorkingCopy();
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  let filtered = list.filter((a) => {
    if (filters.search) {
      const q = filters.search.trim();
      if (!a.full_name.includes(q) && !a.phone.includes(q) && !a.city.includes(q)) return false;
    }
    if (filters.status && a.status !== filters.status) return false;
    if (filters.city && a.city !== filters.city) return false;
    if (filters.hasAppointment === "true" && !a.appointment_date) return false;
    if (filters.hasAppointment === "false" && a.appointment_date) return false;
    if (filters.scoreMin && a.score < Number(filters.scoreMin)) return false;
    if (filters.scoreMax && a.score > Number(filters.scoreMax)) return false;
    if (filters.dateFrom && a.created_at < filters.dateFrom) return false;
    if (filters.dateTo && a.created_at > filters.dateTo) return false;
    return true;
  });

  // Sort
  const sortBy = filters.sortBy || "created_at";
  const sortDir = filters.sortOrder === "asc" ? 1 : -1;
  filtered.sort((a, b) => {
    const av = (a as Record<string, unknown>)[sortBy];
    const bv = (b as Record<string, unknown>)[sortBy];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * sortDir;
    return ((av as number) - (bv as number)) * sortDir;
  });

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return { data, total, page, limit };
}

export function updateDemoApplicantStatus(id: number, status: string) {
  const list = loadWorkingCopy();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false };

  list[idx] = { ...list[idx], status: status as typeof list[0]["status"] };
  saveWorkingCopy(list);
  return { success: true };
}

export function scheduleDemoAppointment(id: number, appointmentDate: string, appointmentJalali: string | null, appointmentTime: string | null) {
  const list = loadWorkingCopy();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false };

  const item = { ...list[idx] };
  item.appointment_date = appointmentDate;
  item.appointment_jalali = appointmentJalali ?? "";
  item.appointment_time = appointmentTime ?? "";
  list[idx] = item;
  saveWorkingCopy(list);
  return { success: true };
}

export function deleteDemoApplicant(id: number) {
  const list = loadWorkingCopy();
  const idx = list.findIndex((a) => a.id === id);
  if (idx === -1) return { success: false, rowsAffected: 0 };

  list.splice(idx, 1);
  saveWorkingCopy(list);
  return { success: true, rowsAffected: 1 };
}

export function getDemoCities(): string[] {
  const list = loadWorkingCopy();
  return [...new Set(list.map((a) => a.city))].sort();
}

// --- Demo data for admin pages (server-side) ---

export function getDemoProfile() {
  return {
    name: "سید محمد رضوی",
    title: "مدیر ارشد بیمه",
    position_code: " senior_manager",
    position_start_date: "1400-01-01",
    bio: "بیش از ۱۵ سال تجربه در صنعت بیمه با تمرکز بر بیمه‌های زندگی و آتیه. عضو انجمن حرفه‌ای بیمهگران.",
    achievements: JSON.stringify([
      "top_performer_2023",
      "golden_club_member",
      "best_recruiter_2022",
    ]),
    current_agent_count: 47,
    growth_agents_6m: 15,
    growth_agents_1y: 32,
    growth_agents_2y: 58,
    growth_policies_6m: 22,
    growth_policies_1y: 45,
    growth_policies_2y: 78,
    site_theme: "warm",
    photo_url: "",
  };
}

export function getDemoSuccessWallEntries() {
  return [
    { id: 1, agent_name: "علی محمدی", quote: "با حمایت تیم، توانستم فروش را ۳ برابر کنم.", images_json: "[]", permission_granted: 1, sort_order: 0, created_at: "2024-01-15" },
    { id: 2, agent_name: "زهرا کریمی", quote: "از صفر شروع کردم و حالا تیم ۱۰ نفره دارم.", images_json: "[]", permission_granted: 1, sort_order: 1, created_at: "2024-02-20" },
    { id: 3, agent_name: "رضا حسینی", quote: "اولین بیمه‌نامه عمرم را در ماه اول فروختم.", images_json: "[]", permission_granted: 1, sort_order: 2, created_at: "2024-03-10" },
  ];
}

export function getDemoGrowthPathStages() {
  return [
    { id: 1, title: "شروع مسیر", description: "آشنایی با اصول پایه بیمه و فروش. گذراندن دوره‌های آموزشی پایه.", sort_order: 0 },
    { id: 2, title: "رشد فردی", description: "کسب مهارت‌های پیشرفته فروش و مدیریت مشتریان.", sort_order: 1 },
    { id: 3, title: "رهبری تیم", description: "آموزش و هدایت نمایندگان جدید و مدیریت تیم فروش.", sort_order: 2 },
    { id: 4, title: "مدیریت ارشد", description: "برنامه‌ریزی استراتژیک و مدیریت سازمانی.", sort_order: 3 },
  ];
}

export function getDemoFaqItems() {
  return [
    { id: 1, question: "شرایط استخدام چیست؟", answer: "حداقل مدرک کارشناسی، علاقه‌مندی به حوزه بیمه و مهارت ارتباطی بالا.", sort_order: 0 },
    { id: 2, question: "آیا آموزش ارائه می‌شود؟", answer: "بله، دوره‌های آموزشی جامع از مبتدی تا پیشرفته برگزار می‌شود.", sort_order: 1 },
    { id: 3, question: "درآمد تقریبی چقدر است؟", answer: "بسته به عملکرد، از ۱۵ تا ۵۰ میلیون تومان در ماه متغیر است.", sort_order: 2 },
    { id: 4, question: "آیا امکان کار پاره‌وقت وجود دارد؟", answer: "بله، امکان همکاری به صورت پاره‌وقت نیز فراهم است.", sort_order: 3 },
  ];
}
