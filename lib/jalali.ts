const JALALI_MONTHS = [
  "فروردین", "اردیبهشت", "خرداد",
  "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر",
  "دی", "بهمن", "اسفند",
] as const;

const JALALI_WEEKDAYS = [
  "شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه",
] as const;

export interface JalaliDate {
  year: number;
  month: number;
  day: number;
}

export interface JalaliDateInfo extends JalaliDate {
  monthName: string;
  weekdayName: string;
  weekdayIndex: number;
  persianDigits: string;
}

function gregorianToJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400);

  for (let i = 0; i < gm - 1; i++) days += g_days_in_month[i];
  days += gd;

  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let jm = 0;
  for (let i = 0; i < 11; i++) {
    if (days >= j_days_in_month[i]) {
      days -= j_days_in_month[i];
    } else {
      jm = i + 1;
      break;
    }
  }
  if (jm === 0) jm = 12;

  return { year: jy, month: jm, day: days + 1 };
}

function jalaliToGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];

  let doy = 0;
  for (let i = 0; i < jm - 1; i++) doy += j_days_in_month[i];
  doy += jd;

  const gy = jy + 621;
  const j20 = gregorianToJalali(gy, 3, 20);
  const nowruzDay = (j20.year === jy && j20.month === 1 && j20.day === 1) ? 20 : 21;

  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) g_days_in_month[1] = 29;

  let remaining = doy - 1;
  let gm = 3;
  let gd = nowruzDay;

  while (remaining > 0) {
    const daysLeftInMonth = g_days_in_month[gm - 1] - gd + 1;
    if (remaining < daysLeftInMonth) {
      gd += remaining;
      remaining = 0;
    } else {
      remaining -= daysLeftInMonth;
      gm++;
      gd = 1;
      if (gm > 12) { gm = 1; }
    }
  }

  return [gy, gm, gd];
}

const PERSIAN_DIGIT_MAP: Record<string, string> = {
  "0": "۰", "1": "۱", "2": "۲", "3": "۳", "4": "۴",
  "5": "۵", "6": "۶", "7": "۷", "8": "۸", "9": "۹",
};

function toPersianDigits(num: number): string {
  return String(num).replace(/\d/g, (d) => PERSIAN_DIGIT_MAP[d]);
}

export function nowJalali(): JalaliDateInfo {
  const now = new Date();
  const j = gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const weekdayIndex = (now.getDay() + 1) % 7;
  return {
    ...j,
    monthName: JALALI_MONTHS[j.month - 1],
    weekdayName: JALALI_WEEKDAYS[weekdayIndex],
    weekdayIndex,
    persianDigits: `${toPersianDigits(j.year)}/${toPersianDigits(j.month)}/${toPersianDigits(j.day)}`,
  };
}

export function formatJalali(isoDate: string): string {
  const datePart = isoDate.split(/[ T]/)[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return isoDate;
  const gy = Number(parts[0]);
  const gm = Number(parts[1]);
  const gd = Number(parts[2]);
  if (!gy || !gm || !gd) return isoDate;
  const j = gregorianToJalali(gy, gm, gd);
  const wd = (new Date(gy, gm - 1, gd).getDay() + 1) % 7;
  return `${JALALI_WEEKDAYS[wd]}، ${toPersianDigits(j.day)} ${JALALI_MONTHS[j.month - 1]} ${toPersianDigits(j.year)}`;
}

export function formatJalaliShort(isoDate: string): string {
  const datePart = isoDate.split(/[ T]/)[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return isoDate;
  const gy = Number(parts[0]);
  const gm = Number(parts[1]);
  const gd = Number(parts[2]);
  if (!gy || !gm || !gd) return isoDate;
  const j = gregorianToJalali(gy, gm, gd);
  return `${toPersianDigits(j.year)}/${toPersianDigits(j.month)}/${toPersianDigits(j.day)}`;
}

export function getJalaliMonthDays(year: number, month: number): { day: number; weekdayIndex: number }[] {
  const j_days_in_month = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, month === 12 && !isJalaliLeapYear(year) ? 29 : 30];

  const daysInMonth = (month === 12 && !isJalaliLeapYear(year)) ? 29 : j_days_in_month[month - 1];
  const [gy, gm, gd] = jalaliToGregorian(year, month, 1);

  const g_days_in_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (gy % 4 === 0 && (gy % 100 !== 0 || gy % 400 === 0)) g_days_in_month[1] = 29;
  let totalDays = 0;
  for (let i = 0; i < gm - 1; i++) totalDays += g_days_in_month[i];
  totalDays += gd;
  const firstWeekday = (totalDays + 3) % 7;

  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    weekdayIndex: (firstWeekday + i) % 7,
  }));
}

export function getJalaliYearMonth(year: number, month: number): { year: number; month: number } {
  if (month < 1) return { year: year - 1, month: 12 };
  if (month > 12) return { year: year + 1, month: 1 };
  return { year, month };
}

export function isJalaliLeapYear(year: number): boolean {
  const rem = (year - 474) % 128;
  return rem < 31 || rem > 127;
}

export function todayJalaliDate(): JalaliDate {
  const now = new Date();
  return gregorianToJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

export function jalaliToIso(j: JalaliDate): string {
  const [gy, gm, gd] = jalaliToGregorian(j.year, j.month, j.day);
  return `${gy}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

export function dateFromIso(iso: string): JalaliDate | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return gregorianToJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
}

export { JALALI_MONTHS, JALALI_WEEKDAYS, toPersianDigits, gregorianToJalali, jalaliToGregorian };
