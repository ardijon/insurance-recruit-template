"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  JALALI_MONTHS,
  getJalaliMonthDays,
  getJalaliYearMonth,
  todayJalaliDate,
  toPersianDigits,
  jalaliToIso,
  dateFromIso,
  type JalaliDate,
} from "@/lib/jalali";

export interface ApplicantFilters {
  scoreMin: string;
  scoreMax: string;
  city: string;
  hasAppointment: "" | "true" | "false";
  status: string;
  dateFrom: string;
  dateTo: string;
}

const STATUS_OPTIONS = [
  { value: "", label: "همه وضعیت‌ها" },
  { value: "new", label: "جدید" },
  { value: "contacted", label: "تماس گرفته شده" },
  { value: "interviewed", label: "مصاحبه شده" },
  { value: "hired", label: "جذب شده" },
  { value: "rejected", label: "رد شده" },
] as const;

const APPOINTMENT_OPTIONS = [
  { value: "", label: "قرار ملاقات" },
  { value: "true", label: "دارای قرار" },
  { value: "false", label: "بدون قرار" },
] as const;

const INITIAL: ApplicantFilters = {
  scoreMin: "",
  scoreMax: "",
  city: "",
  hasAppointment: "",
  status: "",
  dateFrom: "",
  dateTo: "",
};

function hasActiveFilters(f: ApplicantFilters): boolean {
  return f.scoreMin !== "" || f.scoreMax !== "" || f.city !== "" || f.hasAppointment !== "" || f.status !== "" || f.dateFrom !== "" || f.dateTo !== "";
}

function formatJalaliShort(iso: string): string {
  const j = dateFromIso(iso);
  if (!j) return "";
  return `${toPersianDigits(j.year)}/${toPersianDigits(j.month)}/${toPersianDigits(j.day)}`;
}

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filters: ApplicantFilters;
  onFilterChange: (filters: ApplicantFilters) => void;
  cities: string[];
  viewMode: "table" | "card";
  onViewModeChange: (mode: "table" | "card") => void;
}

export function FilterBar({ search, onSearchChange, filters, onFilterChange, cities, viewMode, onViewModeChange }: FilterBarProps) {
  const [open, setOpen] = useState(false);
  const active = hasActiveFilters(filters);
  const activeCount = [filters.scoreMin, filters.scoreMax, filters.city, filters.hasAppointment, filters.status, filters.dateFrom, filters.dateTo].filter(Boolean).length;

  return (
    <div className="mb-4">
      {/* Main bar: search + filter toggle + clear + view toggle */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <svg className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="جستجو..."
            className="w-full rounded-xl border border-border bg-bg-surface text-text-primary pr-10 pl-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-cta"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
            >
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`relative flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors shrink-0 ${
            active
              ? "border-brand-cta bg-brand-cta/10 text-brand-cta"
              : "border-border bg-bg-surface text-text-secondary hover:text-text-primary"
          }`}
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span className="hidden sm:inline">فیلترها</span>
          {active && (
            <span className="absolute -top-1.5 -left-1.5 flex size-4 items-center justify-center rounded-full bg-brand-cta text-[9px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {/* Clear filters */}
        {active && (
          <button
            type="button"
            onClick={() => onFilterChange(INITIAL)}
            className="shrink-0 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-500/20"
          >
            پاک کردن
          </button>
        )}

        {/* View toggle — desktop */}
        <div className="hidden sm:flex items-center rounded-xl border border-border bg-bg-surface overflow-hidden">
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            className={`flex items-center justify-center p-2.5 transition-colors ${viewMode === "table" ? "bg-brand-cta text-white" : "text-text-secondary hover:text-text-primary"}`}
            title="نمای جدولی"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("card")}
            className={`flex items-center justify-center p-2.5 transition-colors ${viewMode === "card" ? "bg-brand-cta text-white" : "text-text-secondary hover:text-text-primary"}`}
            title="نمای کارتی"
          >
            <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="7" rx="1" />
              <rect x="3" y="14" width="18" height="7" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      {/* Expanded filters */}
      {open && (
        <FilterPanel filters={filters} onChange={onFilterChange} cities={cities} />
      )}
    </div>
  );
}

function FilterPanel({ filters, onChange, cities }: { filters: ApplicantFilters; onChange: (f: ApplicantFilters) => void; cities: string[] }) {
  return (
    <div className="mt-3 rounded-xl border border-border bg-bg-surface p-3 animate-scale-in">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {/* Status */}
        <select
          value={filters.status}
          onChange={(e) => onChange({ ...filters, status: e.target.value })}
          className="rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cta"
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* City */}
        <select
          value={filters.city}
          onChange={(e) => onChange({ ...filters, city: e.target.value })}
          className="rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cta"
        >
          <option value="">شهر</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Appointment */}
        <select
          value={filters.hasAppointment}
          onChange={(e) => onChange({ ...filters, hasAppointment: e.target.value as "" | "true" | "false" })}
          className="rounded-lg border border-border bg-bg-base px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cta"
        >
          {APPOINTMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Score range — compact */}
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={0}
            max={100}
            value={filters.scoreMin}
            onChange={(e) => onChange({ ...filters, scoreMin: e.target.value })}
            placeholder="امتیاز از"
            className="w-1/2 rounded-lg border border-border bg-bg-base px-2 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cta"
          />
          <span className="text-text-secondary text-xs">تا</span>
          <input
            type="number"
            min={0}
            max={100}
            value={filters.scoreMax}
            onChange={(e) => onChange({ ...filters, scoreMax: e.target.value })}
            placeholder="تا"
            className="w-1/2 rounded-lg border border-border bg-bg-base px-2 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-cta"
          />
        </div>

        {/* Date from — Jalali picker */}
        <JalaliDateInput
          label="از تاریخ"
          value={filters.dateFrom}
          onChange={(v) => onChange({ ...filters, dateFrom: v })}
        />

        {/* Date to — Jalali picker */}
        <JalaliDateInput
          label="تا تاریخ"
          value={filters.dateTo}
          onChange={(v) => onChange({ ...filters, dateTo: v })}
        />
      </div>
    </div>
  );
}

let globalZIndex = 10000;

function JalaliDateInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const today = todayJalaliDate();
  const initial = dateFromIso(value);
  const [viewYear, setViewYear] = useState(initial?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(initial?.month ?? today.month);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [zIndex, setZIndex] = useState(10000);
  const DROPDOWN_WIDTH = 256;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, close]);

  function handleOpen() {
    if (!open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const top = rect.bottom + 4;
      let left = rect.left;

      if (left + DROPDOWN_WIDTH > window.innerWidth - 8) {
        left = window.innerWidth - DROPDOWN_WIDTH - 8;
      }
      if (left < 8) left = 8;

      globalZIndex = (globalZIndex + 1) % 1000000;
      setZIndex(globalZIndex);
      setDropdownPos({ top, left });
    }
    setOpen(!open);
  }

  const displayText = value ? formatJalaliShort(value) : "";

  function prevMonth() {
    const p = getJalaliYearMonth(viewYear, viewMonth - 1);
    setViewYear(p.year);
    setViewMonth(p.month);
  }

  function nextMonth() {
    const n = getJalaliYearMonth(viewYear, viewMonth + 1);
    setViewYear(n.year);
    setViewMonth(n.month);
  }

  function handleDayClick(day: number) {
    const jDate: JalaliDate = { year: viewYear, month: viewMonth, day };
    onChange(jalaliToIso(jDate));
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    onChange("");
  }

  const days = getJalaliMonthDays(viewYear, viewMonth);
  const todayStr = `${today.year}-${today.month}-${today.day}`;

  return (
    <>
      <div ref={triggerRef} className="relative">
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpen}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpen(); }}
          className={`flex w-full items-center gap-2 rounded-lg border bg-bg-base px-3 py-2 text-sm transition-colors cursor-pointer ${
            value ? "border-brand-cta/30 text-text-primary" : "border-border text-text-secondary"
          } focus:outline-none focus:ring-2 focus:ring-brand-cta`}
        >
          <svg className="size-4 shrink-0 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="flex-1 text-right truncate">{displayText || label}</span>
          {value && (
            <button type="button" onClick={handleClear} className="text-text-secondary hover:text-red-500 shrink-0">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {open && createPortal(
        <div
          ref={dropdownRef}
          className="fixed w-64 rounded-xl border border-border bg-bg-base shadow-xl animate-scale-in p-3"
          style={{ top: dropdownPos.top, left: dropdownPos.left, zIndex }}
        >
          {/* Header */}
          <div className="mb-2 flex items-center justify-between">
            <button type="button" onClick={prevMonth} className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-colors">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <span className="text-xs font-bold text-text-primary">
              {JALALI_MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}
            </span>
            <button type="button" onClick={nextMonth} className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface transition-colors">
              <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>

          {/* Weekday headers */}
          <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-text-secondary">
            {["ش", "ی", "د", "س", "چ", "پ", "ج"].map((d) => (
              <div key={d} className="py-0.5">{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
            {days.length > 0 && days[0].weekdayIndex > 0 && (
              Array.from({ length: days[0].weekdayIndex }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))
            )}
            {days.map((d) => {
              const dStr = `${viewYear}-${viewMonth}-${d.day}`;
              const isToday = dStr === todayStr;
              const isSelected = value === jalaliToIso({ year: viewYear, month: viewMonth, day: d.day });

              return (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => handleDayClick(d.day)}
                  className={`relative rounded-md py-1.5 text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-brand-cta text-white shadow-sm"
                      : isToday
                        ? "border border-accent text-accent"
                        : "text-text-primary hover:bg-bg-surface"
                  }`}
                >
                  {toPersianDigits(d.day)}
                </button>
              );
            })}
          </div>

          {/* Today button */}
          <button
            type="button"
            onClick={() => {
              onChange(jalaliToIso(today));
              setOpen(false);
            }}
            className="mt-2 w-full rounded-lg bg-brand-cta/10 py-1.5 text-xs font-medium text-brand-cta transition-colors hover:bg-brand-cta/20"
          >
            امروز
          </button>
        </div>,
        document.body,
      )}
    </>
  );
}

export { STATUS_OPTIONS };
