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

// 10 mandatory questions, each with 4 options (value 1..4).
const OPT = (low: string, midLow: string, midHigh: string, high: string) => [
  { value: 1, label: low },
  { value: 2, label: midLow },
  { value: 3, label: midHigh },
  { value: 4, label: high },
];

const QUESTIONS: FitQuestion[] = [
  {
    id: "persuasion",
    label: "در ارتباط با افراد و متقاعدسازی چقدر مهارت دارید؟",
    options: OPT("خیلی کم", "کم", "زیاد", "خیلی زیاد"),
  },
  {
    id: "persistence",
    label: "وقتی با مخالفت یا رد شدن مواجه میشوید، چقدر پیگیری میکنید؟",
    options: OPT("زود تسلیم میشوم", "گاهی ادامه میدهم", "معمولاً ادامه میدهم", "همیشه تا آخر پیگیری میکنم"),
  },
  {
    id: "planning",
    label: "در انجام کارها چقدر برنامهریزی و نظم دارید؟",
    options: OPT("بدون برنامه", "کم", "زیاد", "کاملاً منظم و برنامهریزیشده"),
  },
  {
    id: "learning",
    label: "به یادگیری مهارتهای جدید و آموزش چقدر علاقه دارید؟",
    options: OPT("علاقهای ندارم", "کم", "زیاد", "بسیار علاقهمندم"),
  },
  {
    id: "resilience",
    label: "در برابر فشار و استرس چقدر مقاوم هستید؟",
    options: OPT("خیلی کم", "کم", "زیاد", "خیلی زیاد"),
  },
  {
    id: "communication",
    label: "با افراد غریبه چقدر راحت حرف میزنید؟",
    options: OPT("اصلاً", "کم", "زیاد", "خیلی راحت"),
  },
  {
    id: "goal_orientation",
    label: "برای رسیدن به هدف چقدر متمرکز و هدفمند هستید؟",
    options: OPT("کم", "متوسط", "زیاد", "بشدت هدفمند"),
  },
  {
    id: "self_motivation",
    label: "بدون ناظر چقدر خودت انجام وظیف میکنید؟",
    options: OPT("نیاز به نظارت دارم", "گاهی", "زیاد", "کاملاً خودانگیخته"),
  },
  {
    id: "empathy",
    label: "نیاز و احساسات مشتری را چقدر درک میکنید؟",
    options: OPT("خیلی کم", "کم", "زیاد", "عالی"),
  },
  {
    id: "discipline",
    label: "به تعهدات زمانی و مالی چقدر پایبند هستید؟",
    options: OPT("کم", "متوسط", "زیاد", "کاملاً منضبط"),
  },
];

export const FIT_QUESTION_IDS = QUESTIONS.map((q) => q.id);
export const MAX_FIT_SCORE = 20;

export function getFitQuestions(): FitQuestion[] {
  return QUESTIONS;
}

export function computeFitResult(answers: FitAnswers): FitResult {
  const MAX_PER = 4;
  let total = 0;
  let answered = 0;

  for (const q of QUESTIONS) {
    const val = answers[q.id];
    if (typeof val === "number" && val >= 1 && val <= MAX_PER) {
      total += val;
      answered++;
    }
  }

  const maxPossible = answered * MAX_PER;
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
