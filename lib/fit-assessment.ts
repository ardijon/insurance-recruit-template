export interface FitQuestion {
  id: string;
  label: string;
  options: { value: number; label: string }[];
}

export interface FitAnswers {
  [questionId: string]: number;
}

export interface FitResult {
  fitScore: number;
  maxFitScore: number;
  summary: string;
}

const QUESTIONS: FitQuestion[] = [
  {
    id: "persuasion",
    label: "در ارتباط با افراد و متقاعدسازی چقدر مهارت دارید؟",
    options: [
      { value: 1, label: "خیلی کم" },
      { value: 2, label: "کم" },
      { value: 3, label: "متوسط" },
      { value: 4, label: "زیاد" },
      { value: 5, label: "خیلی زیاد" },
    ],
  },
  {
    id: "persistence",
    label: "وقتی با مخالفت یا رد شدن مواجه می‌شوید، چقدر پیگیری می‌کنید؟",
    options: [
      { value: 1, label: "تقریباً هیچ" },
      { value: 2, label: "کم" },
      { value: 3, label: "متوسط" },
      { value: 4, label: "زیاد" },
      { value: 5, label: "همیشه تا آخر پیگیری می‌کنم" },
    ],
  },
  {
    id: "planning",
    label: "در کارهای خود چقدر برنامه‌ریزی و نظم دارید؟",
    options: [
      { value: 1, label: "بدون برنامه" },
      { value: 2, label: "کم" },
      { value: 3, label: "متوسط" },
      { value: 4, label: "زیاد" },
      { value: 5, label: "کاملاً منظم و برنامه‌ریزی‌شده" },
    ],
  },
  {
    id: "learning",
    label: "چقدر به یادگیری مهارت‌های جدید و آموزش علاقه دارید؟",
    options: [
      { value: 1, label: "علاقه ندارم" },
      { value: 2, label: "کم" },
      { value: 3, label: "متوسط" },
      { value: 4, label: "زیاد" },
      { value: 5, label: "بسیار علاقه‌مندم" },
    ],
  },
];

export const MAX_FIT_SCORE = 20;

export function getFitQuestions(): FitQuestion[] {
  return QUESTIONS;
}

export function computeFitResult(answers: FitAnswers): FitResult {
  let total = 0;
  let answered = 0;

  for (const q of QUESTIONS) {
    const val = answers[q.id];
    if (typeof val === "number" && val >= 1 && val <= 5) {
      total += val;
      answered++;
    }
  }

  const maxPossible = answered * 5;
  const score = maxPossible > 0 ? Math.round((total / maxPossible) * MAX_FIT_SCORE) : 0;

  let summary: string;
  if (answered === 0) {
    summary = "تکمیل نشده";
  } else if (score >= 15) {
    summary = "تناسب شغلی بالا";
  } else if (score >= 10) {
    summary = "تناسب شغلی متوسط";
  } else {
    summary = "نیاز به بررسی بیشتر";
  }

  return {
    fitScore: score,
    maxFitScore: MAX_FIT_SCORE,
    summary,
  };
}
