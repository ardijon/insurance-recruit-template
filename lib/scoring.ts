export interface ApplicantScoringInput {
  salesBackground: string | null;
  networkSize: string | null;
  availability: string | null;
}

export interface ScoreBreakdown {
  total: number;
  salesBackground: number;
  networkSize: number;
  availability: number;
}

const PERSIAN_DIGITS: Record<string, string> = {
  "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4",
  "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
};

const ARABIC_DIGITS: Record<string, string> = {
  "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4",
  "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
};

function normalizeDigits(text: string): string {
  return text.replace(/[۰-۹]/g, (ch) => PERSIAN_DIGITS[ch] ?? ch)
             .replace(/[٠-٩]/g, (ch) => ARABIC_DIGITS[ch] ?? ch);
}

function extractFirstNumber(text: string): number | null {
  const normalized = normalizeDigits(text);
  const match = normalized.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

const NO_EXPERIENCE_KEYWORDS = /بدون\s*سابقه|بی experience|تازه\s*کار|مبتدی/i;
const EXPERIENCE_KEYWORDS = /سابقه|فروش|بیمه|کار|فعالیت|تجربه|دارم|دارنده|داشتم/i;
const MANAGEMENT_KEYWORDS = /مدیر|مدیریت|رهبری|سرپرست|سرگروه/i;

const FULL_TIME_KEYWORDS = /تمام\s*وقت|full[\s-]?time/i;
const PART_TIME_KEYWORDS = /پاره\s*وقت|part[\s-]?time/i;

const LARGE_NETWORK_KEYWORDS = /زیاد|بزرگ|وسیع|گسترده/i;
const SMALL_NETWORK_KEYWORDS = /کم|محدود|کوچک/i;

export function computeBreakdown(input: ApplicantScoringInput): ScoreBreakdown {
  const sb = input.salesBackground ?? "";
  const ns = input.networkSize ?? "";
  const av = input.availability ?? "";

  const salesBackground = scoreSalesBackground(sb);
  const networkSize = scoreNetworkSize(ns);
  const availability = scoreAvailability(av);

  return {
    total: Math.min(100, salesBackground + networkSize + availability),
    salesBackground,
    networkSize,
    availability,
  };
}

function scoreSalesBackground(text: string): number {
  if (!text.trim()) return 0;
  if (NO_EXPERIENCE_KEYWORDS.test(text)) return 0;

  let score = 0;

  if (EXPERIENCE_KEYWORDS.test(text)) {
    score += 15;
  } else {
    score += 5;
  }

  const years = extractFirstNumber(text);
  if (years !== null && years > 0) {
    score += Math.min(years, 10) * 2.5;
  }

  if (MANAGEMENT_KEYWORDS.test(text)) {
    score += 10;
  }

  return Math.min(40, Math.round(score));
}

function scoreNetworkSize(text: string): number {
  if (!text.trim()) return 0;

  const number = extractFirstNumber(text);
  if (number !== null && number > 0) {
    return Math.min(30, Math.round(number / 10));
  }

  if (LARGE_NETWORK_KEYWORDS.test(text)) return 20;
  if (SMALL_NETWORK_KEYWORDS.test(text)) return 5;

  return 10;
}

function scoreAvailability(text: string): number {
  if (!text.trim()) return 0;

  if (FULL_TIME_KEYWORDS.test(text)) return 30;
  if (PART_TIME_KEYWORDS.test(text)) return 15;

  const hours = extractFirstNumber(text);
  if (hours !== null && hours > 0) {
    return Math.min(30, Math.round((hours / 40) * 30));
  }

  return 10;
}
