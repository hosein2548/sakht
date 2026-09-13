// src/shared/phone/phone.ts
// ============================================================
// ابزار مرکزی شماره موبایل
// - تمام عملیات شماره موبایل در کل پروژه از اینجا استفاده می‌کند
// - پشتیبانی از اعداد فارسی/عربی
// - پشتیبانی از پیش‌شماره +98 و 98
// ============================================================

// ============================================================
// Constants
// ============================================================

/** پیش‌شماره‌های معتبر موبایل ایران */
const VALID_PREFIXES = [
  "0910", "0911", "0912", "0913", "0914", "0915", "0916", "0917", "0918", "0919",
  "0990", "0991", "0992", "0993", "0994",
  "0901", "0902", "0903", "0905",
  "0930", "0933", "0935", "0936", "0937", "0938", "0939",
  "0920", "0921", "0922", "0923",
] as const;

/** طول استاندارد شماره موبایل ایران */
const PHONE_LENGTH = 11;

/** پیش‌شماره کشور */
const COUNTRY_CODE = "98";

// ============================================================
// Digits Conversion
// ============================================================

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

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
 * تبدیل اعداد انگلیسی به فارسی (برای نمایش)
 */
export function toPersianDigits(value: string): string {
  return value.replace(/\d/g, (d) => PERSIAN_DIGITS[parseInt(d, 10)]);
}

// ============================================================
// Normalization
// ============================================================

/**
 * نرمال‌سازی ورودی شماره موبایل
 * - تبدیل اعداد فارسی/عربی به انگلیسی
 * - حذف کاراکترهای غیرعددی
 * - تبدیل +98 یا 98 به 0
 *
 * مثال:
 *   "۰۹۱۲۳۴۵۶۷۸۹"  → "09123456789"
 *   "+989123456789" → "09123456789"
 *   "989123456789"  → "09123456789"
 *   "0912 345 6789" → "09123456789"
 */
export function normalizePhone(value: string): string {
  if (!value) return "";

  // 1) اعداد فارسی/عربی به انگلیسی
  let result = toEnglishDigits(value);

  // 2) حذف کاراکترهای غیرعددی (به جز + که برای پیش‌شماره لازمه)
  result = result.replace(/[^\d+]/g, "");

  // 3) تبدیل +98 یا 98 به 0
  if (result.startsWith("+98")) {
    result = "0" + result.slice(3);
  } else if (result.startsWith("98") && result.length >= 12) {
    result = "0" + result.slice(2);
  }

  // 4) اطمینان از شروع با 0
  if (result.length > 0 && !result.startsWith("0")) {
    result = "0" + result;
  }

  // 5) کوتاه کردن به طول استاندارد
  if (result.length > PHONE_LENGTH) {
    result = result.slice(0, PHONE_LENGTH);
  }

  return result;
}

// ============================================================
// Validation
// ============================================================

/**
 * بررسی معتبر بودن شماره موبایل
 * - دقیقاً ۱۱ رقم
 * - با 09 شروع بشه
 * - پیش‌شماره معتبر باشه
 */
export function isValidPhone(value: string): boolean {
  const normalized = normalizePhone(value);

  if (normalized.length !== PHONE_LENGTH) return false;

  // چک کردن پیش‌شماره
  const prefix = normalized.slice(0, 4);
  return VALID_PREFIXES.some((p) => p === prefix);
}

/**
 * اعتبارسنجی با پیام خطا
 */
export function validatePhone(
  value: string
): { valid: true } | { valid: false; message: string } {
  if (!value) {
    return { valid: false, message: "شماره موبایل را وارد کنید." };
  }

  const normalized = normalizePhone(value);

  if (normalized.length === 0) {
    return { valid: false, message: "شماره موبایل را وارد کنید." };
  }

  if (normalized.length < PHONE_LENGTH) {
    return {
      valid: false,
      message: `شماره موبایل باید ${PHONE_LENGTH} رقم باشد.`,
    };
  }

  if (!normalized.startsWith("09")) {
    return {
      valid: false,
      message: "شماره موبایل باید با ۰۹ شروع شود.",
    };
  }

  if (!isValidPhone(normalized)) {
    return {
      valid: false,
      message: "پیش‌شماره وارد شده معتبر نیست.",
    };
  }

  return { valid: true };
}

// ============================================================
// Display / Masking
// ============================================================

/**
 * ماسک کردن شماره برای نمایش امن
 * مثال: "09123456789" → "0912***6789"
 */
export function maskPhone(value: string): string {
  const normalized = normalizePhone(value);
  if (normalized.length !== PHONE_LENGTH) return value;

  return `${normalized.slice(0, 4)}***${normalized.slice(7)}`;
}

/**
 * نمایش زیبا با فاصله
 * مثال: "09123456789" → "0912 345 6789"
 */
export function formatPhone(value: string): string {
  const normalized = normalizePhone(value);
  if (normalized.length !== PHONE_LENGTH) return value;

  return `${normalized.slice(0, 4)} ${normalized.slice(4, 7)} ${normalized.slice(7)}`;
}

/**
 * فرمت با اعداد فارسی
 * مثال: "09123456789" → "۰۹۱۲ ۳۴۵ ۶۷۸۹"
 */
export function formatPhonePersian(value: string): string {
  return toPersianDigits(formatPhone(value));
}