export interface SalesOption {
  value: number;
  label: string;
}

export interface SalesQuestion {
  id: "sales_experience" | "sales_result" | "leadership";
  label: string;
  options: SalesOption[];
}

export const SALES_QUESTIONS: SalesQuestion[] = [
  {
    id: "sales_experience",
    label: "سابقه فعالیت در فروش یا بیمه چقدر است؟",
    options: [
      { value: 1, label: "بدون سابقه" },
      { value: 2, label: "کمتر از ۲ سال" },
      { value: 3, label: "۲ تا ۵ سال" },
      { value: 4, label: "بیش از ۵ سال" },
    ],
  },
  {
    id: "sales_result",
    label: "سطح موفقیت و نتیجه فروش شما چگونه بوده؟",
    options: [
      { value: 1, label: "تجربه محدود" },
      { value: 2, label: "چند فروش موفق" },
      { value: 3, label: "فروشنده موفق" },
      { value: 4, label: "فروشنده برتر / رکورد" },
    ],
  },
  {
    id: "leadership",
    label: "تجربه مدیریت یا رهبری تیم دارید؟",
    options: [
      { value: 1, label: "ندارم" },
      { value: 2, label: "سرپرستی تیم کوچک" },
      { value: 3, label: "مدیریت تیم متوسط" },
      { value: 4, label: "مدیریت تیم بزرگ" },
    ],
  },
];

type SalesBackground = Partial<Record<"sales_experience" | "sales_result" | "leadership", number | null>>;

// Converts the JSON-encoded sales_background (numbers) into human-readable
// Persian text. Falls back gracefully for unknown/legacy values.
export function formatSalesBackground(raw: string | null | undefined): string {
  if (!raw) return "—";
  let parsed: SalesBackground;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return raw; // legacy plain text
  }
  if (typeof parsed !== "object" || parsed === null) return raw;

  const parts: string[] = [];
  for (const q of SALES_QUESTIONS) {
    const val = parsed[q.id];
    if (val == null) continue;
    const opt = q.options.find((o) => o.value === Number(val));
    if (opt) parts.push(opt.label);
  }
  return parts.length ? parts.join(" · ") : "—";
}
