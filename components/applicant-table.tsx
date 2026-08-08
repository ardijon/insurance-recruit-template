"use client";

import { memo } from "react";
import { formatJalali, toPersianDigits } from "@/lib/jalali";
import { StatusBadge } from "@/components/status-badge";

export interface Applicant {
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

type SortField = "created_at" | "score" | "full_name" | "appointment_date";

interface Props {
  applicants: Applicant[];
  sortBy: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
  onStatusChange: (id: number, status: string) => void;
  onDetail: (applicant: Applicant) => void;
  onSchedule: (applicant: Applicant) => void;
  onDelete: (id: number) => void;
}

const SCORE_COLORS: Record<string, string> = {
  high: "text-success",
  mid: "text-accent",
  low: "text-text-secondary",
};

function getScoreColor(score: number | null): string {
  if (score === null) return SCORE_COLORS.low;
  if (score >= 70) return SCORE_COLORS.high;
  if (score >= 40) return SCORE_COLORS.mid;
  return SCORE_COLORS.low;
}

function SortIcon({ field, current, order }: { field: SortField; current: SortField; order: "asc" | "desc" }) {
  if (field !== current) {
    return (
      <svg className="size-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 5v14M5 12l7 7 7-7" />
      </svg>
    );
  }
  return order === "asc" ? (
    <svg className="size-3 text-brand-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ) : (
    <svg className="size-3 text-brand-cta" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

export const ApplicantTable = memo(function ApplicantTable({ applicants, sortBy, sortOrder, onSort, onStatusChange, onDetail, onSchedule, onDelete }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-bg-surface">
            <th className="px-4 py-3 text-right font-medium text-text-secondary">
              <button type="button" onClick={() => onSort("full_name")} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                نام
                <SortIcon field="full_name" current={sortBy} order={sortOrder} />
              </button>
            </th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">تلفن</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">شهر</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">
              <button type="button" onClick={() => onSort("score")} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                امتیاز
                <SortIcon field="score" current={sortBy} order={sortOrder} />
              </button>
            </th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">وضعیت</th>
            <th className="px-4 py-3 text-right font-medium text-text-secondary">
              <button type="button" onClick={() => onSort("appointment_date")} className="flex items-center gap-1 hover:text-text-primary transition-colors">
                قرار
                <SortIcon field="appointment_date" current={sortBy} order={sortOrder} />
              </button>
            </th>
            <th className="px-4 py-3 text-center font-medium text-text-secondary">عملیات</th>
          </tr>
        </thead>
        <tbody>
          {applicants.map((a) => (
            <tr key={a.id} className="border-b border-border/50 last:border-0 hover:bg-bg-surface/50 transition-colors">
              <td className="px-4 py-3">
                <button type="button" onClick={() => onDetail(a)} className="font-medium text-text-primary hover:text-brand-cta transition-colors">
                  {a.full_name}
                </button>
              </td>
              <td className="px-4 py-3">
                <a href={`tel:${a.phone}`} className="text-text-secondary hover:text-brand-cta transition-colors ltr" dir="ltr">
                  {a.phone}
                </a>
              </td>
              <td className="px-4 py-3 text-text-secondary">{a.city ?? "—"}</td>
              <td className="px-4 py-3">
                {a.score !== null ? (
                  <span className={`font-bold ${getScoreColor(a.score)}`}>{toPersianDigits(a.score)}</span>
                ) : (
                  <span className="text-text-secondary">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={a.status} onChange={(s) => onStatusChange(a.id, s)} editable />
              </td>
              <td className="px-4 py-3 text-text-secondary">
                {a.appointment_date ? (
                  <span className="text-success font-medium">
                    {formatJalali(a.appointment_date)}
                    {a.appointment_time && ` ${a.appointment_time}`}
                  </span>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSchedule(a)}
                    className="rounded-lg p-1.5 text-brand-cta transition-colors hover:bg-brand-cta/10"
                    title={a.appointment_date ? "ویرایش قرار" : "تعیین وقت"}
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (window.confirm("آیا از حذف این متقاضی اطمینان دارید؟")) onDelete(a.id); }}
                    className="rounded-lg p-1.5 text-red-500 transition-colors hover:bg-red-500/10"
                    title="حذف"
                  >
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

export type { SortField };
