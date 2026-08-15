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
  return process.env.DEMO_MODE === "true" || process.env.NEXT_PUBLIC_DEMO_MODE === "true";
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
