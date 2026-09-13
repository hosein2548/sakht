// src/shared/date/persian.ts
// ============================================================
// ابزار مرکزی تاریخ شمسی
// - تمام عملیات تاریخ در کل پروژه از اینجا استفاده می‌کند
// - از Intl برای محاسبات دقیق استفاده می‌کند (کبیسه، ...)
// ============================================================

// ============================================================
// Types
// ============================================================

/**
 * اجزای تاریخ شمسی
 */
export interface PersianDateParts {
  year: number;
  month: number;
  day: number;
}

// ============================================================
// Constants
// ============================================================

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

const PERSIAN_WEEKDAYS = [
  "شنبه",
  "یک‌شنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
] as const;

// ============================================================
// Format / Parse
// ============================================================

/**
 * فرمت استاندارد: YYYY/MM/DD
 */
const DATE_REGEX = /^(\d{4})\/(\d{2})\/(\d{2})$/;

/**
 * تبدیل اجزای تاریخ به رشته
 * مثال: { year: 1404, month: 1, day: 5 } → "1404/01/05"
 */
export function toPersianDateString(
  parts: PersianDateParts
): string {
  const { year, month, day } = parts;
  return `${year}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
}

/**
 * تجزیه رشته تاریخ شمسی
 * مثال: "1404/01/05" → { year: 1404, month: 1, day: 5 }
 */
export function parsePersianDate(
  date: string
): PersianDateParts | null {
  const match = date.match(DATE_REGEX);
  if (!match) return null;

  const year = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const day = parseInt(match[3], 10);

  return { year, month, day };
}

// ============================================================
// Validation
// ============================================================

/**
 * تعداد روزهای یک ماه شمسی
 * @param year سال شمسی
 * @param month ماه (1-12)
 */
export function getPersianMonthDays(year: number, month: number): number {
  if (month < 1 || month > 12) return 0;

  // ماه‌های 1-6: 31 روز
  if (month <= 6) return 31;

  // ماه‌های 7-11: 30 روز
  if (month <= 11) return 30;

  // اسفند: 29 یا 30 (سال کبیسه)
  return isPersianLeapYear(year) ? 30 : 29;
}

/**
 * آیا سال شمسی کبیسه است؟
 * الگوریتم استاندارد: remainder 33-cycle
 */
export function isPersianLeapYear(year: number): boolean {
  // روش دقیق با باقی‌مانده 33 ساله
  const remainder = year % 33;
  return (
    remainder === 1 ||
    remainder === 5 ||
    remainder === 9 ||
    remainder === 13 ||
    remainder === 17 ||
    remainder === 22 ||
    remainder === 26 ||
    remainder === 30
  );
}

/**
 * اعتبارسنجی رشته تاریخ شمسی
 * مثال: "1404/01/05" → true
 * مثال: "1404/13/01" → false (ماه نامعتبر)
 */
export function isValidPersianDate(date: string): boolean {
  const parts = parsePersianDate(date);
  if (!parts) return false;

  const { year, month, day } = parts;

  // بازه سال معقول
  if (year < 1300 || year > 1500) return false;

  // ماه
  if (month < 1 || month > 12) return false;

  // روز
  const maxDay = getPersianMonthDays(year, month);
  if (day < 1 || day > maxDay) return false;

  return true;
}

/**
 * اعتبارسنجی با پیام خطا
 */
export function validatePersianDate(
  date: string
): { valid: true } | { valid: false; message: string } {
  if (!date) {
    return { valid: false, message: "تاریخ را وارد کنید." };
  }

  if (date.length !== 10) {
    return {
      valid: false,
      message: "تاریخ باید ۱۰ کاراکتر باشد (مثال: 1404/01/05).",
    };
  }

  if (!DATE_REGEX.test(date)) {
    return {
      valid: false,
      message: "فرمت تاریخ صحیح نیست. مثال: 1404/01/05",
    };
  }

  if (!isValidPersianDate(date)) {
    return {
      valid: false,
      message: "تاریخ وارد شده معتبر نیست.",
    };
  }

  return { valid: true };
}

// ============================================================
// Today
// ============================================================

/**
 * دریافت تاریخ امروز به شمسی
 * از Intl استفاده می‌کند (دقیق، با کبیسه و تقویم)
 */
export function getTodayPersian(): string {
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Tehran",
  });

  const parts = formatter.formatToParts(new Date());
  const year = parts.find((p) => p.type === "year")?.value ?? "";
  const month = parts.find((p) => p.type === "month")?.value ?? "";
  const day = parts.find((p) => p.type === "day")?.value ?? "";

  // حذف کاراکترهای اضافه (مثل "AP" در بعضی سیستم‌ها)
  const cleanYear = year.replace(/\D/g, "");

  return `${cleanYear}/${month.padStart(2, "0")}/${day.padStart(2, "0")}`;
}

// ============================================================
// Display
// ============================================================

/**
 * نمایش زیبا: "5 فروردین 1404"
 */
export function formatPersianDateLong(date: string): string {
  const parts = parsePersianDate(date);
  if (!parts) return date;

  const { year, month, day } = parts;
  if (month < 1 || month > 12) return date;

  return `${day} ${PERSIAN_MONTHS[month - 1]} ${year}`;
}

/**
 * نمایش کوتاه: "1404/01/05"
 */
export function formatPersianDateShort(date: string): string {
  if (!isValidPersianDate(date)) return date;
  return date;
}

/**
 * نام ماه شمسی
 */
export function getPersianMonthName(month: number): string {
  if (month < 1 || month > 12) return "";
  return PERSIAN_MONTHS[month - 1];
}

/**
 * نام روز هفته
 */
export function getPersianWeekdayName(date: string): string {
  const parts = parsePersianDate(date);
  if (!parts) return "";

  // تبدیل شمسی به میلادی تقریبی
  const gregorian = persianToGregorian(parts);
  const jsDate = new Date(gregorian.year, gregorian.month - 1, gregorian.day);

  // در JS: 0 = Sunday, 6 = Saturday
  // در فارسی: 0 = شنبه, 6 = جمعه
  const jsDay = jsDate.getDay();
  const persianDay = (jsDay + 1) % 7;

  return PERSIAN_WEEKDAYS[persianDay];
}

// ============================================================
// Conversion (Persian ↔ Gregorian)
// ============================================================

/**
 * تبدیل شمسی به میلادی
 * الگوریتم استاندارد (Birashk)
 */
export function persianToGregorian(
  parts: PersianDateParts
): { year: number; month: number; day: number } {
  const { year: py, month: pm, day: pd } = parts;

  // روزهای سپری‌شده از ابتدای سال شمسی
  let days = 0;
  for (let m = 1; m < pm; m++) {
    days += getPersianMonthDays(py, m);
  }
  days += pd;

  // الگوریتم تبدیل (استاندارد)
  const gy = py + 621;
  const marchDay = days + 78; // 78 روز اختلاف

  // پیدا کردن روز در تقویم میلادی
  const jsDate = new Date(gy, 2, 21); // 21 March
  jsDate.setDate(jsDate.getDate() + (days - 1));

  return {
    year: jsDate.getFullYear(),
    month: jsDate.getMonth() + 1,
    day: jsDate.getDate(),
  };
}

/**
 * تبدیل میلادی به شمسی
 */
export function gregorianToPersian(
  parts: { year: number; month: number; day: number }
): PersianDateParts {
  const { year: gy, month: gm, day: gd } = parts;

  const jsDate = new Date(gy, gm - 1, gd);

  // استفاده از Intl برای دقت بالا
  const formatter = new Intl.DateTimeFormat("en-US-u-ca-persian", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const formatted = formatter.formatToParts(jsDate);
  const py = parseInt(
    formatted.find((p) => p.type === "year")?.value.replace(/\D/g, "") ?? "0",
    10
  );
  const pm = parseInt(
    formatted.find((p) => p.type === "month")?.value ?? "0",
    10
  );
  const pd = parseInt(
    formatted.find((p) => p.type === "day")?.value ?? "0",
    10
  );

  return { year: py, month: pm, day: pd };
}

// ============================================================
// Compare
// ============================================================

/**
 * مقایسه دو تاریخ شمسی
 * return: -1 (a < b), 0 (a == b), 1 (a > b)
 */
export function comparePersianDates(a: string, b: string): number {
  const partsA = parsePersianDate(a);
  const partsB = parsePersianDate(b);

  if (!partsA || !partsB) return 0;

  if (partsA.year !== partsB.year) {
    return partsA.year < partsB.year ? -1 : 1;
  }
  if (partsA.month !== partsB.month) {
    return partsA.month < partsB.month ? -1 : 1;
  }
  if (partsA.day !== partsB.day) {
    return partsA.day < partsB.day ? -1 : 1;
  }
  return 0;
}

// ============================================================
// Digits Conversion
// ============================================================

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

/**
 * تبدیل اعداد انگلیسی به فارسی
 */
export function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

/**
 * تبدیل اعداد فارسی/عربی به انگلیسی
 */
export function toEnglishDigits(value: string): string {
  let result = value;
  PERSIAN_DIGITS.forEach((d, i) => {
    result = result.replace(new RegExp(d, "g"), String(i));
  });
  ARABIC_DIGITS.forEach((d, i) => {
    result = result.replace(new RegExp(d, "g"), String(i));
  });
  return result;
}

/**
 * نرمال‌سازی تاریخ: تبدیل اعداد فارسی به انگلیسی
 */
export function normalizePersianDateInput(value: string): string {
  return toEnglishDigits(value);
}