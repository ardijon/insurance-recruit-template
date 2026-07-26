"use client";

import { useState, useRef, useEffect } from "react";
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  getJalaliMonthDays,
  getJalaliYearMonth,
  todayJalaliDate,
  toPersianDigits,
  type JalaliDate,
} from "@/lib/jalali";

interface JalaliDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

function formatValue(j: JalaliDate): string {
  return `${toPersianDigits(j.year)}/${toPersianDigits(j.month)}/${toPersianDigits(j.day)}`;
}

function parseValue(val: string): JalaliDate | null {
  const match = val.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (!match) return null;
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (y < 1300 || y > 1500 || m < 1 || m > 12 || d < 1 || d > 31) return null;
  return { year: y, month: m, day: d };
}

type ViewMode = "calendar" | "month" | "year";

export function JalaliDatePicker({ value, onChange, placeholder }: JalaliDatePickerProps) {
  const today = todayJalaliDate();
  const parsed = parseValue(value);
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(today.year);
  const [viewMonth, setViewMonth] = useState(today.month);
  const [mode, setMode] = useState<ViewMode>("calendar");
  const [yearPage, setYearPage] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleOpen() {
    if (!open) {
      setViewYear(parsed?.year ?? today.year);
      setViewMonth(parsed?.month ?? today.month);
      setMode("calendar");
    }
    setOpen(!open);
  }

  const days = getJalaliMonthDays(viewYear, viewMonth);
  const todayStr = `${today.year}-${today.month}-${today.day}`;
  const selStr = parsed ? `${parsed.year}-${parsed.month}-${parsed.day}` : "";

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

  function selectDay(day: number) {
    const j: JalaliDate = { year: viewYear, month: viewMonth, day };
    onChange(formatValue(j));
    setOpen(false);
  }

  // Year selector: show 12 years per page
  const yearsPerPage = 12;
  const baseYear = 1380;
  const yearPageIndex = Math.floor((viewYear - baseYear) / yearsPerPage) + yearPage;
  const startYear = baseYear + yearPageIndex * yearsPerPage;
  const yearOptions = Array.from({ length: yearsPerPage }, (_, i) => startYear + i);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className={`w-full rounded-lg border bg-bg-base text-text-primary px-3 py-2 text-sm text-right transition-colors ${
          open ? "border-brand-cta ring-2 ring-brand-cta/20" : "border-border hover:border-brand-cta/50"
        } ${!value ? "text-text-secondary" : ""}`}
      >
        {value || placeholder || "انتخاب تاریخ"}
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-text-secondary pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-50 mt-1 w-72 rounded-xl border border-border bg-bg-surface p-3 shadow-lg animate-scale-in">
          {mode === "calendar" && (
            <>
              {/* Header — clickable year & month */}
              <div className="mb-2 flex items-center justify-between">
                <button type="button" onClick={prevMonth} className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-base hover:text-text-primary transition-colors">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setMode("month")}
                    className="rounded-md px-2 py-0.5 text-xs font-bold text-text-primary hover:bg-bg-base transition-colors"
                  >
                    {JALALI_MONTHS[viewMonth - 1]}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setYearPage(0); setMode("year"); }}
                    className="rounded-md px-2 py-0.5 text-xs font-bold text-text-primary hover:bg-bg-base transition-colors"
                  >
                    {toPersianDigits(viewYear)}
                  </button>
                </div>
                <button type="button" onClick={nextMonth} className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-base hover:text-text-primary transition-colors">
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>

              {/* Weekday headers */}
              <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-[10px] font-medium text-text-secondary">
                {JALALI_WEEKDAYS.map((d) => (
                  <div key={d} className="py-0.5">{d.slice(0, 2)}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-0.5 text-center text-xs">
                {days.length > 0 && days[0].weekdayIndex > 0 &&
                  Array.from({ length: days[0].weekdayIndex }).map((_, i) => (
                    <div key={`e-${i}`} />
                  ))
                }
                {days.map((d) => {
                  const dKey = `${viewYear}-${viewMonth}-${d.day}`;
                  const isToday = dKey === todayStr;
                  const isSelected = dKey === selStr;
                  return (
                    <button
                      key={d.day}
                      type="button"
                      onClick={() => selectDay(d.day)}
                      className={`rounded-lg py-1.5 text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-brand-cta text-white shadow-sm"
                          : isToday
                            ? "border border-accent text-accent"
                            : "text-text-primary hover:bg-bg-base"
                      }`}
                    >
                      {toPersianDigits(d.day)}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === "month" && (
            <>
              <p className="mb-2 text-center text-xs font-bold text-text-primary">انتخاب ماه</p>
              <div className="grid grid-cols-3 gap-1.5">
                {JALALI_MONTHS.map((name, i) => {
                  const isActive = viewMonth === i + 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setViewMonth(i + 1); setMode("calendar"); }}
                      className={`rounded-lg py-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-brand-cta text-white shadow-sm"
                          : "text-text-primary hover:bg-bg-base"
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {mode === "year" && (
            <>
              <p className="mb-2 text-center text-xs font-bold text-text-primary">انتخاب سال</p>
              <div className="grid grid-cols-3 gap-1.5">
                {yearOptions.map((y) => {
                  if (y < 1300 || y > 1500) return <div key={y} />;
                  const isActive = viewYear === y;
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => { setViewYear(y); setMode("calendar"); }}
                      className={`rounded-lg py-2 text-xs font-medium transition-all ${
                        isActive
                          ? "bg-brand-cta text-white shadow-sm"
                          : "text-text-primary hover:bg-bg-base"
                      }`}
                    >
                      {toPersianDigits(y)}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setYearPage((p) => p - 1)}
                  className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-base hover:text-text-primary transition-colors"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setYearPage((p) => p + 1)}
                  className="flex size-7 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-base hover:text-text-primary transition-colors"
                >
                  <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
              </div>
            </>
          )}

          {/* Clear */}
          {value && (
            <div className="mt-2 border-t border-border pt-2 flex justify-center">
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                className="text-xs text-red-500 hover:text-red-600 transition-colors"
              >
                پاک کردن تاریخ
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
