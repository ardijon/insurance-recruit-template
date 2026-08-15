"use client";

import { useState, useEffect } from "react";
import {
  JALALI_MONTHS,
  JALALI_WEEKDAYS,
  getJalaliMonthDays,
  getJalaliYearMonth,
  todayJalaliDate,
  formatJalali,
  toPersianDigits,
  jalaliToIso,
  dateFromIso,
  type JalaliDate,
} from "@/lib/jalali";

interface JalaliCalendarProps {
  selectedDate: string | null;
  selectedTime: string | null;
  onDateChange: (isoDate: string) => void;
  onTimeChange: (time: string) => void;
}

const TIME_SLOTS = [
  "۰۹:۰۰", "۱۰:۰۰", "۱۱:۰۰", "۱۲:۰۰",
  "۱۳:۰۰", "۱۴:۰۰", "۱۵:۰۰", "۱۶:۰۰",
  "۱۷:۰۰", "۱۸:۰۰", "۱۹:۰۰", "۲۰:۰۰",
];

export function JalaliCalendar({ selectedDate, selectedTime, onDateChange, onTimeChange }: JalaliCalendarProps) {
  const today = todayJalaliDate();
  const initiallySelected = selectedDate ? dateFromIso(selectedDate) : today;
  const [viewYear, setViewYear] = useState(initiallySelected?.year ?? today.year);
  const [viewMonth, setViewMonth] = useState(initiallySelected?.month ?? today.month);
  const [selected, setSelected] = useState<JalaliDate | null>(initiallySelected);
  const [time, setTime] = useState(selectedTime ?? "");
  const [viewMode, setViewMode] = useState<"days" | "times">("days");

  useEffect(() => {
    if (selectedDate) {
      const j = dateFromIso(selectedDate);
      if (j) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sync external prop to internal state
        setSelected(j);
        setViewYear(j.year);
        setViewMonth(j.month);
      }
    } else {
      setSelected(null);
    }
  }, [selectedDate]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync external prop to internal state
    setTime(selectedTime ?? "");
  }, [selectedTime]);

  const days = getJalaliMonthDays(viewYear, viewMonth);
  const todayStr = `${today.year}-${today.month}-${today.day}`;

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
    setSelected(jDate);
    onDateChange(jalaliToIso(jDate));
  }

  function handleTimeClick(t: string) {
    setTime(t);
    onTimeChange(t);
  }

  const selStr = selected ? `${selected.year}-${selected.month}-${selected.day}` : "";

  if (viewMode === "times") {
    return (
      <div className="animate-fade-in">
        <div className="mb-3 text-center">
          <p className="text-sm font-medium text-text-primary">
            ساعت ملاقات را انتخاب کنید
          </p>
          {selected && (
            <p className="text-xs text-text-secondary mt-1">
              {formatJalali(jalaliToIso(selected))}
            </p>
          )}
        </div>
        <div className="grid grid-cols-3 gap-2" dir="ltr">
          {TIME_SLOTS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => handleTimeClick(t)}
              className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                time === t
                  ? "border-brand-cta bg-brand-cta text-white shadow-sm"
                  : "border-border bg-bg-base text-text-primary hover:border-brand-cta"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="mt-3 flex justify-between">
          <button
            type="button"
            onClick={() => setViewMode("days")}
            className="text-xs text-text-secondary hover:text-text-primary transition-colors"
          >
            بازگشت به تقویم
          </button>
          {time && (
            <p className="text-xs text-success">
              ✓ ساعت {time} انتخاب شد
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-scale-in select-none">
      {/* Header: month/year navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={prevMonth}
          className="flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
          aria-label="ماه قبل"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={viewDir() === "rtl" ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
          </svg>
        </button>

        <span className="text-sm font-bold text-text-primary">
          {JALALI_MONTHS[viewMonth - 1]} {toPersianDigits(viewYear)}
        </span>

        <button
          type="button"
          onClick={nextMonth}
          className="flex size-8 items-center justify-center rounded-lg text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors"
          aria-label="ماه بعد"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points={viewDir() === "rtl" ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
          </svg>
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-0.5 text-center text-xs font-medium text-text-secondary">
        {JALALI_WEEKDAYS.map((d) => (
          <div key={d} className="py-1">{d.slice(0, 2)}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-0.5 text-center text-sm">
        {/* Leading empty cells */}
        {days.length > 0 && days[0].weekdayIndex > 0 && (
          Array.from({ length: days[0].weekdayIndex }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))
        )}

        {days.map((d) => {
          const dStr = `${viewYear}-${viewMonth}-${d.day}`;
          const isToday = dStr === todayStr;
          const isSelected = dStr === selStr;
          const isPast = viewYear < today.year ||
            (viewYear === today.year && viewMonth < today.month) ||
            (viewYear === today.year && viewMonth === today.month && d.day < today.day);

          return (
            <button
              key={d.day}
              type="button"
              onClick={() => !isPast && handleDayClick(d.day)}
              disabled={isPast}
              className={`relative rounded-lg py-2 text-sm font-medium transition-all ${
                isSelected
                  ? "bg-brand-cta text-white shadow-sm"
                  : isToday
                    ? "border border-accent text-accent"
                    : isPast
                      ? "text-text-secondary/30 cursor-not-allowed"
                      : "text-text-primary hover:bg-bg-surface"
              }`}
            >
              {toPersianDigits(d.day)}
            </button>
          );
        })}
      </div>

      {/* Selected date display */}
      {selected && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-text-secondary">
            {formatJalali(jalaliToIso(selected))}
          </p>
          <button
            type="button"
            onClick={() => setViewMode("times")}
            className="rounded-lg bg-brand-cta px-4 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          >
            انتخاب ساعت
          </button>
        </div>
      )}

      {time && (
        <p className="mt-2 text-xs text-success text-center">
          ✓ تاریخ و ساعت انتخاب شد: {selected ? formatJalali(jalaliToIso(selected)) : ""} — {time}
        </p>
      )}
    </div>
  );
}

function viewDir() {
  return "rtl";
}
