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

export const NETWORK_SIZE_OPTIONS: SalesOption[] = [
  { value: 1, label: "کمتر از ۵۰ نفر" },
  { value: 2, label: "۵۰ تا ۲۰۰ نفر" },
  { value: 3, label: "۲۰۰ تا ۵۰۰ نفر" },
  { value: 4, label: "بیش از ۵۰۰ نفر" },
];

export const AVAILABILITY_OPTIONS: SalesOption[] = [
  { value: 1, label: "پارهوقت کم" },
  { value: 2, label: "پارهوقت" },
  { value: 3, label: "تماموقت" },
  { value: 4, label: "تماموقت + انعطاف کامل" },
];

// Maps a stored answer (numeric 1..4, as number or string) back to its
// Persian label. Unknown/legacy free-text values pass through unchanged,
// so rows written before the structured form keep displaying correctly.
function formatOptionValue(raw: string | number | null | undefined, options: SalesOption[]): string {
  if (raw === null || raw === undefined || raw === "") return "—";
  const num = Number(String(raw).trim());
  if (Number.isInteger(num)) {
    const opt = options.find((o) => o.value === num);
    if (opt) return opt.label;
  }
  return String(raw);
}

export function formatNetworkSize(raw: string | number | null | undefined): string {
  return formatOptionValue(raw, NETWORK_SIZE_OPTIONS);
}

export function formatAvailability(raw: string | number | null | undefined): string {
  return formatOptionValue(raw, AVAILABILITY_OPTIONS);
}

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
