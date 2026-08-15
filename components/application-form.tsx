"use client";

import { useState } from "react";
import { step1Schema, step2Schema, step3Schema } from "@/lib/validation";
import type { Step1Data } from "@/lib/validation";
import { getFitQuestions, MAX_FIT_SCORE } from "@/lib/fit-assessment";
import type { FitAnswers } from "@/lib/fit-assessment";
import { useReferral } from "@/hooks/use-referral";
import { SALES_QUESTIONS } from "@/lib/sales-background";

const STEPS = [
  { label: "اطلاعات پایه", number: 1 },
  { label: "سابقه", number: 2 },
  { label: "انگیزه و ارزیابی", number: 3 },
] as const;

type StepErrors = Partial<Record<string, string>>;

interface Step2Structured {
  sales_experience: number | null;
  sales_result: number | null;
  leadership: number | null;
  network_size: number | null;
  availability: number | null;
}

const STEP2_QUESTIONS: { id: keyof Step2Structured; label: string; options: { value: number; label: string }[] }[] = [
  {
    id: "sales_experience",
    label: "سابقه فعالیت در فروش یا بیمه چقدر است؟",
    options: SALES_QUESTIONS.find((q) => q.id === "sales_experience")!.options,
  },
  {
    id: "sales_result",
    label: "سطح موفقیت و نتیجه فروش شما چگونه بوده؟",
    options: SALES_QUESTIONS.find((q) => q.id === "sales_result")!.options,
  },
  {
    id: "leadership",
    label: "تجربه مدیریت یا رهبری تیم دارید؟",
    options: SALES_QUESTIONS.find((q) => q.id === "leadership")!.options,
  },
  {
    id: "network_size",
    label: "اندازه شبکه ارتباطی شما چقدر است؟",
    options: [
      { value: 1, label: "کمتر از ۵۰ نفر" },
      { value: 2, label: "۵۰ تا ۲۰۰ نفر" },
      { value: 3, label: "۲۰۰ تا ۵۰۰ نفر" },
      { value: 4, label: "بیش از ۵۰۰ نفر" },
    ],
  },
  {
    id: "availability",
    label: "میزان زمان قابل اختصاص به فعالیت؟",
    options: [
      { value: 1, label: "پارهوقت کم" },
      { value: 2, label: "پارهوقت" },
      { value: 3, label: "تماموقت" },
      { value: 4, label: "تماموقت + انعطاف کامل" },
    ],
  },
];

export function ApplicationForm() {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const [step1, setStep1] = useState<Step1Data>({ full_name: "", phone: "", city: "" });
  const [step2, setStep2] = useState<Step2Structured>({ sales_experience: null, sales_result: null, leadership: null, network_size: null, availability: null });
  const [step3, setStep3] = useState<{ motivation: string }>({ motivation: "" });
  const [errors, setErrors] = useState<StepErrors>({});

  const { referralCode, referralAgentName, referralLoading } = useReferral();

  const fitQuestions = getFitQuestions();
  const [fitAnswers, setFitAnswers] = useState<FitAnswers>({});

  function validateStep(s: number): boolean {
    let result;
    if (s === 0) result = step1Schema.safeParse(step1);
    else if (s === 1) {
      const payload = {
        sales_experience: step2.sales_experience ?? (undefined as unknown),
        sales_result: step2.sales_result ?? (undefined as unknown),
        leadership: step2.leadership ?? (undefined as unknown),
        network_size: step2.network_size ?? (undefined as unknown),
        availability: step2.availability ?? (undefined as unknown),
      };
      result = step2Schema.safeParse(payload);
    }     else {
      result = step3Schema.safeParse({ motivation: step3.motivation, fit_answers: fitAnswers });
    }

    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: StepErrors = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join(".");
      fieldErrors[key] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  }

  function nextStep() {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function prevStep() {
    setStep((s) => Math.max(0, s - 1));
  }

  async function handleSubmit() {
    if (!validateStep(step)) return;
    setSubmitting(true);
    setServerError("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...step1,
          sales_experience: step2.sales_experience,
          sales_result: step2.sales_result,
          leadership: step2.leadership,
          network_size: step2.network_size,
          availability: step2.availability,
          ...step3,
          referral_code: referralCode,
          fit_answers: fitAnswers,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setServerError(data.error ?? "خطا در ثبت اطلاعات");
        return;
      }

      setDone(true);
    } catch {
      setServerError("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <section className="flex flex-col items-center gap-4 py-16">
        <div className="size-16 rounded-full bg-[var(--color-success)] flex items-center justify-center text-white text-3xl">
          ✓
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-brand-emphasis)]">
          درخواست شما با موفقیت ثبت شد
        </h2>
        <p className="text-[var(--color-text-secondary)] text-center max-w-md">
          اطلاعات شما بررسی خواهد شد و در اسرع وقت با شما تماس میگیریم.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="application-form-heading" className="max-w-lg mx-auto py-8 px-4">
      <h2 id="application-form-heading" className="text-2xl font-bold text-[var(--color-brand-emphasis)] mb-6 text-center">
        فرم درخواست نمایندگی
      </h2>

      {referralLoading && (
        <p className="text-sm text-[var(--color-text-secondary)] text-center mb-4">در حال بررسی لینک معرف...</p>
      )}
      {referralAgentName && (
        <p className="text-sm text-[var(--color-brand-cta)] text-center mb-4 font-medium">
          معرفیشده توسط: {referralAgentName}
        </p>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8" dir="ltr">
        {STEPS.map((s, i) => (
          <div key={s.number} className="flex items-center flex-1 last:flex-none">
            <div
              className={`size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                i <= step
                  ? "bg-[var(--color-brand-cta)] text-white"
                  : "bg-[var(--color-border)] text-[var(--color-text-secondary)]"
              }`}
            >
              {s.number}
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-1 flex-1 mx-1 rounded transition-colors ${
                  i < step ? "bg-[var(--color-brand-cta)]" : "bg-[var(--color-border)]"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <p className="text-sm text-[var(--color-text-secondary)] mb-6 text-center">
        مرحله {step + 1} از {STEPS.length}: {STEPS[step].label}
      </p>

      <div key={`step-${step}`} className="animate-fade-in">
      {/* Step 1: Basic Info */}
      {step === 0 && (
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              نام و نام خانوادگی <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={step1.full_name}
              onChange={(e) => setStep1({ ...step1, full_name: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] text-[var(--color-text-primary)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-cta)]"
              placeholder="مثال: علی محمدی"
            />
            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              شماره تماس <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={step1.phone}
              onChange={(e) => setStep1({ ...step1, phone: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] text-[var(--color-text-primary)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-cta)]"
              placeholder="مثال: 09123456789"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              شهر
            </label>
            <input
              type="text"
              value={step1.city}
              onChange={(e) => setStep1({ ...step1, city: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] text-[var(--color-text-primary)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-cta)]"
              placeholder="مثال: تهران"
            />
          </div>
        </div>
      )}

      {/* Step 2: Structured background */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          {STEP2_QUESTIONS.map((q) => (
            <div key={q.id}>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{q.label}</p>
              <div className="grid grid-cols-2 gap-2">
                {q.options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStep2({ ...step2, [q.id]: opt.value })}
                    className={`px-3 py-2 text-xs sm:text-sm rounded-lg border text-right transition-colors ${
                      step2[q.id] === opt.value
                        ? "bg-[var(--color-brand-cta)] text-white border-[var(--color-brand-cta)]"
                        : "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand-cta)]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {errors[q.id] && <p className="text-red-500 text-xs mt-1">{errors[q.id]}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Motivation + mandatory fit assessment */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
              انگیزه شما از همکاری چیست؟ <span className="text-red-500">*</span>
            </label>
            <textarea
              value={step3.motivation}
              onChange={(e) => setStep3({ ...step3, motivation: e.target.value })}
              maxLength={2000}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-base)] text-[var(--color-text-primary)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-cta)] resize-none h-28"
              placeholder="دلایل خود برای همکاری را بنویسید"
            />
            {errors.motivation && <p className="text-red-500 text-xs mt-1">{errors.motivation}</p>}
          </div>

          {/* Mandatory fit assessment */}
          <div className="border-t border-[var(--color-border)] pt-4">
            <p className="text-sm font-bold text-[var(--color-brand-emphasis)] mb-1">ارزیابی تناسب شغلی</p>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">پاسخ به تمام ۱۰ سوال الزامی است — حداکثر امتیاز: {MAX_FIT_SCORE}</p>
            <div className="flex flex-col gap-4">
              {fitQuestions.map((q) => (
                <div key={q.id}>
                  <p className="text-sm font-medium text-[var(--color-text-primary)] mb-2">{q.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setFitAnswers({ ...fitAnswers, [q.id]: opt.value })}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                          fitAnswers[q.id] === opt.value
                            ? "bg-[var(--color-brand-cta)] text-white border-[var(--color-brand-cta)]"
                            : "bg-[var(--color-bg-base)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:border-[var(--color-brand-cta)]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {errors["fit_answers"] && <p className="text-red-500 text-xs mt-2">{errors["fit_answers"]}</p>}
          </div>
        </div>
      )}
      </div>

      {serverError && (
        <p className="text-red-500 text-sm mt-4 text-center">{serverError}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8">
        <button
          type="button"
          onClick={prevStep}
          disabled={step === 0}
          className="px-6 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-primary)] disabled:opacity-40 transition-opacity"
        >
          قبلی
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            className="px-6 py-2 rounded-lg bg-[var(--color-brand-cta)] text-white font-medium transition-opacity hover:opacity-90"
          >
            بعدی
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="px-6 py-2 rounded-lg bg-[var(--color-success)] text-white font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "در حال ارسال..." : "ثبت درخواست"}
          </button>
        )}
      </div>
    </section>
  );
}
