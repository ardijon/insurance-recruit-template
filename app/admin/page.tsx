"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { formatJalali, formatJalaliShort, toPersianDigits } from "@/lib/jalali";
import { JalaliCalendar } from "@/components/jalali-calendar";
import { ToastContainer } from "@/components/toast";
import type { Toast } from "@/hooks/use-toast";
import { FilterBar, type ApplicantFilters } from "@/components/applicant-filters";
import { ApplicantTable, type SortField } from "@/components/applicant-table";
import { StatusBadge, STATUS_CONFIG } from "@/components/status-badge";
import { Pagination } from "@/components/pagination";
import { adminFetch } from "@/lib/api-client";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

interface Applicant {
  id: number;
  full_name: string;
  phone: string;
  city: string | null;
  score: number | null;
  referral_code: string | null;
  sales_background: string | null;
  network_size: string | null;
  availability: string | null;
  motivation: string | null;
  appointment_date: string | null;
  appointment_time: string | null;
  status: string;
  created_at: string;
}

const SCORE_COLORS = [
  { min: 70, color: "text-success", bg: "bg-success/10", ring: "ring-success/20" },
  { min: 40, color: "text-accent", bg: "bg-accent/10", ring: "ring-accent/20" },
  { min: 0, color: "text-text-secondary", bg: "bg-text-secondary/10", ring: "ring-text-secondary/20" },
] as const;

function getScoreStyle(score: number | null) {
  if (score === null) return { color: "text-text-secondary", bg: "bg-text-secondary/10", ring: "ring-text-secondary/20" };
  return SCORE_COLORS.find((s) => score >= s.min) ?? SCORE_COLORS[2];
}

function todayIsoStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const INITIAL_FILTERS: ApplicantFilters = {
  scoreMin: "",
  scoreMax: "",
  city: "",
  hasAppointment: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

export default function AdminDashboard() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [cities, setCities] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState<ApplicantFilters>(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "card">("table");

  const [schedulingFor, setSchedulingFor] = useState<number | null>(null);
  const [calendarDate, setCalendarDate] = useState<string | null>(null);
  const [calendarTime, setCalendarTime] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [detailFor, setDetailFor] = useState<Applicant | null>(null);
  const [profile, setProfile] = useState<{ position_code: string; current_agent_count: number } | null>(null);

  const toastIdRef = useRef(0);
  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = toastIdRef.current++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "20");
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.scoreMin) params.set("score_min", filters.scoreMin);
    if (filters.scoreMax) params.set("score_max", filters.scoreMax);
    if (filters.city) params.set("city", filters.city);
    if (filters.hasAppointment) params.set("has_appointment", filters.hasAppointment);
    if (filters.status) params.set("status", filters.status);
    if (filters.dateFrom) params.set("date_from", filters.dateFrom);
    if (filters.dateTo) params.set("date_to", filters.dateTo);
    params.set("sort_by", sortBy);
    params.set("sort_order", sortOrder);

    adminFetch(`/api/admin/applicants?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setApplicants(data.data);
        setTotalCount(data.total);
      })
      .catch(() => {
        if (cancelled) return;
        addToast("خطا در بارگذاری متقاضیان", "error");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [page, debouncedSearch, filters, sortBy, sortOrder, addToast]);

  useEffect(() => {
    adminFetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    adminFetch("/api/admin/cities")
      .then((res) => res.json())
      .then((data) => setCities(data ?? []))
      .catch(() => {});
  }, []);

  const todayAppointments = applicants.filter((a) => a.appointment_date === todayIsoStr()).length;

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "score" ? "desc" : "asc");
    }
    setPage(1);
    setLoading(true);
  }

  function handleFilterChange(f: ApplicantFilters) {
    setFilters(f);
    setPage(1);
    setLoading(true);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    setLoading(true);
  }

  function openScheduler(applicant: Applicant) {
    setSchedulingFor(applicant.id);
    setCalendarDate(applicant.appointment_date ?? null);
    setCalendarTime(applicant.appointment_time ?? null);
  }

  async function saveAppointment() {
    if (!schedulingFor || !calendarDate) return;
    setSaving(true);
    try {
      const res = await adminFetch("/api/admin/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: schedulingFor, appointment_date: calendarDate, appointment_time: calendarTime }),
      });
      if (!res.ok) throw new Error();
      setApplicants((prev) =>
        prev.map((a) =>
          a.id === schedulingFor ? { ...a, appointment_date: calendarDate, appointment_time: calendarTime } : a,
        ),
      );
      addToast("قرار ملاقات ثبت شد");
      setSchedulingFor(null);
      setCalendarDate(null);
      setCalendarTime(null);
    } catch {
      addToast("خطا در ثبت قرار", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      const res = await adminFetch("/api/admin/applicants", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error();
      setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      addToast("وضعیت بروزرسانی شد");
    } catch {
      addToast("خطا در بروزرسانی وضعیت", "error");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا از حذف این متقاضی اطمینان دارید؟")) return;
    try {
      const res = await adminFetch(`/api/admin/applicants?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setApplicants((prev) => prev.filter((a) => a.id !== id));
      setTotalCount((t) => t - 1);
      addToast("متقاضی حذف شد");
    } catch {
      addToast("خطا در حذف", "error");
    }
  }

  return (
    <>
      {/* Compact stat pills — mobile */}
      <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatPill icon="users" label="متقاضی" value={totalCount} color="brand-emphasis" />
        <StatPill icon="calendar" label="قرار امروز" value={todayAppointments} color="success" />
        <StatPill icon="agent" label="نماینده فعال" value={profile?.current_agent_count ?? null} color="brand-emphasis" />
      </div>

      {/* Search + Filter bar — sticky under header on mobile */}
      <div className="mb-4 sticky top-[57px] z-40 -mx-4 px-4 bg-bg-base/95 backdrop-blur-sm sm:static sm:bg-transparent sm:backdrop-blur-none sm:mx-0 sm:px-0">
        <FilterBar
          search={search}
          onSearchChange={handleSearchChange}
          filters={filters}
          onFilterChange={handleFilterChange}
          cities={cities}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="size-8 animate-spin rounded-full border-2 border-brand-cta border-t-transparent" />
        </div>
      ) : applicants.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-bg-surface py-16 text-center">
          <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-bg-base">
            <svg className="size-6 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          </div>
          <p className="text-sm text-text-secondary">{search || Object.values(filters).some(Boolean) ? "نتیجه‌ای یافت نشد" : "هنوز متقاضی ثبت نشده"}</p>
        </div>
      ) : (
        <>
          {/* Desktop table — only when table mode */}
          <div className={`${viewMode === "table" ? "hidden sm:block" : "hidden"}`}>
            <ApplicantTable
              applicants={applicants}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onStatusChange={handleStatusChange}
              onDetail={setDetailFor}
              onSchedule={openScheduler}
              onDelete={handleDelete}
            />
          </div>
          {/* Card view — always on mobile, only when card mode on desktop */}
          <div className={`grid gap-2.5 grid-cols-1 sm:grid-cols-2 ${viewMode === "table" ? "sm:hidden" : ""}`}>
            {applicants.map((applicant) => {
              const scoreStyle = getScoreStyle(applicant.score);
              return (
                <div
                  key={applicant.id}
                  className="rounded-xl border border-border bg-bg-surface overflow-hidden transition-shadow hover:shadow-sm"
                >
                {/* Main row */}
                <div className="flex items-start gap-3 p-3">
                  {/* Avatar + score */}
                  <div className="relative shrink-0">
                    <div className={`flex size-10 items-center justify-center rounded-full ring-2 ${scoreStyle.ring} ${scoreStyle.bg}`}>
                      <span className={`text-sm font-bold ${scoreStyle.color}`}>
                        {applicant.full_name.charAt(0)}
                      </span>
                    </div>
                    {applicant.score !== null && (
                      <span className={`absolute -bottom-1 -left-1 flex size-5 items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-bg-surface ${scoreStyle.bg} ${scoreStyle.color}`}>
                        {toPersianDigits(applicant.score)}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <button
                        type="button"
                        onClick={() => setDetailFor(applicant)}
                        className="font-bold text-text-primary truncate hover:text-brand-cta transition-colors"
                      >
                        {applicant.full_name}
                      </button>
                      <a
                        href={`tel:${applicant.phone}`}
                        className="shrink-0 text-xs text-text-secondary hover:text-brand-cta transition-colors ltr"
                        dir="ltr"
                      >
                        {applicant.phone}
                      </a>
                      {applicant.city && (
                        <span className="shrink-0 text-xs text-text-secondary">· {applicant.city}</span>
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                      <StatusBadge status={applicant.status} onChange={(s) => handleStatusChange(applicant.id, s)} editable />
                      {applicant.appointment_date && (
                        <span className="flex items-center gap-1 text-sm font-medium text-success">
                          <svg className="size-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {formatJalali(applicant.appointment_date)} {applicant.appointment_time && `— ${applicant.appointment_time}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action row */}
                <div className="flex border-t border-border/50 bg-bg-base/50">
                  <button
                    type="button"
                    onClick={() => setDetailFor(applicant)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary hover:bg-bg-surface"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="16" x2="12" y2="12" />
                      <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                    جزئیات
                  </button>
                  <div className="w-px bg-border/50" />
                  <button
                    type="button"
                    onClick={() => openScheduler(applicant)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-brand-cta transition-colors hover:bg-brand-cta/10"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    {applicant.appointment_date ? "ویرایش قرار" : "تعیین وقت"}
                  </button>
                  <div className="w-px bg-border/50" />
                  <button
                    type="button"
                    onClick={() => handleDelete(applicant.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    حذف
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        </>
      )}

      {/* Pagination */}
      {!loading && applicants.length > 0 && (
        <Pagination page={page} total={totalCount} limit={20} onChange={setPage} />
      )}

      {/* Detail modal — bottom sheet on mobile */}
      {detailFor && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl bg-bg-base shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            {/* Handle bar — mobile only */}
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex size-10 items-center justify-center rounded-full ${getScoreStyle(detailFor.score).bg}`}>
                    <span className={`text-sm font-bold ${getScoreStyle(detailFor.score).color}`}>{detailFor.full_name.charAt(0)}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-text-primary">{detailFor.full_name}</h2>
                    <p className="text-xs text-text-secondary">{detailFor.phone}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setDetailFor(null)} className="flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-colors">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Info label="شهر" value={detailFor.city ?? "—"} />
                <Info label="امتیاز" value={detailFor.score !== null ? toPersianDigits(detailFor.score) : "ثبت نشده"} />
                <Info label="کد معرف" value={detailFor.referral_code ?? "—"} />
                <Info label="تاریخ ثبت" value={formatJalaliShort(detailFor.created_at)} />
                <Info label="وضعیت" value={STATUS_CONFIG[detailFor.status]?.label ?? "جدید"} />
                {detailFor.appointment_date && <Info label="قرار ملاقات" value={`${formatJalali(detailFor.appointment_date)} — ${detailFor.appointment_time ?? "—"}`} />}
              </div>

              <div className="mt-4 border-t border-border pt-4 flex flex-col gap-3">
                <DetailBlock label="سابقه فروش" value={detailFor.sales_background} />
                <DetailBlock label="شبکه ارتباطی" value={detailFor.network_size} />
                <DetailBlock label="زمان در دسترس" value={detailFor.availability} />
                <DetailBlock label="انگیزه" value={detailFor.motivation} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scheduling modal — bottom sheet on mobile */}
      {schedulingFor !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-bg-base shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-center pt-3 sm:hidden">
              <div className="h-1 w-10 rounded-full bg-border" />
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">تعیین وقت ملاقات</h2>
                <button type="button" onClick={() => setSchedulingFor(null)} className="flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-colors">
                  <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <JalaliCalendar selectedDate={calendarDate} selectedTime={calendarTime} onDateChange={setCalendarDate} onTimeChange={setCalendarTime} />
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={() => setSchedulingFor(null)} className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-text-primary transition-colors hover:bg-bg-surface">انصراف</button>
                <button type="button" onClick={saveAppointment} disabled={saving || !calendarDate} className="flex-1 rounded-xl bg-brand-cta px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50">
                  {saving ? "در حال ذخیره..." : "ذخیره قرار"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </>
  );
}

function StatPill({ icon, label, value, color, suffix }: { icon: string; label: string; value: number | null; color: string; suffix?: string }) {
  const colorMap: Record<string, string> = {
    "brand-emphasis": "bg-brand-emphasis/10 text-brand-emphasis",
    "accent": "bg-accent/10 text-accent",
    "success": "bg-success/10 text-success",
  };

  return (
    <div className={`flex items-center gap-2 rounded-xl px-4 py-2.5 ring-1 ring-border/30 shrink-0 sm:shrink sm:justify-center ${colorMap[color]}`}>
      {icon === "users" && (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )}
      {icon === "star" && (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
      {icon === "calendar" && (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      )}
      {icon === "agent" && (
        <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )}
      <span className="text-sm font-bold">{suffix ?? (value !== null ? toPersianDigits(value) : "—")}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg-surface px-3 py-2.5">
      <p className="text-[11px] text-text-secondary">{label}</p>
      <p className="text-sm font-medium text-text-primary mt-0.5">{value}</p>
    </div>
  );
}

function DetailBlock({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-text-secondary mb-1">{label}</p>
      <p className="text-sm leading-relaxed text-text-primary bg-bg-surface rounded-lg px-3 py-2">{value}</p>
    </div>
  );
}
