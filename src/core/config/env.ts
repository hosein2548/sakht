// src/core/config/env.ts
// ============================================================
// مرکز تنظیمات محیطی پروژه
// - تمام آدرس‌های پایه و مقادیر محیطی از اینجا خونده می‌شن
// - برای تغییر آدرس دامین، فقط کافیه .env.local رو تغییر بدید
// ============================================================

// ============================================================
// Helper
// ============================================================

/**
 * خواندن متغیر محیطی با fallback
 */
function readEnv(
  key: string,
  fallback: string
): string {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `⚠️  [env] "${key}" تعریف نشده، از fallback استفاده می‌شود: ${fallback}`
      );
    }
    return fallback;
  }
  return value.trim();
}

// ============================================================
// Server-only Config
// ============================================================

/**
 * کلید مخفی برای امضای Session Cookie
 * ⚠️ این مقدار فقط در سرور قابل دسترسی است
 */
export const AUTH_SESSION_SECRET = readEnv(
  "AUTH_SESSION_SECRET",
  ""
);

/**
 * آدرس پایه API های PHP (سمت سرور)
 * برای پروکسی route.ts استفاده می‌شود
 */
export const PHP_API_BASE_URL = readEnv(
  "PHP_API_BASE_URL",
  "https://web120.ir/apartment/next"
);

/**
 * آدرس API verify کد ورود (سمت سرور)
 */
export const PHP_VERIFY_API_BASE_URL = readEnv(
  "PHP_VERIFY_API_BASE_URL",
  "https://web120.ir/apartment/app_ver1"
);

// ============================================================
// Client-safe Config (NEXT_PUBLIC_*)
// ============================================================

/**
 * آدرس پایه API های PHP (سمت کلاینت)
 */
export const PHP_API_BASE_URL_CLIENT = readEnv(
  "NEXT_PUBLIC_PHP_API_BASE_URL",
  "https://web120.ir/apartment/next"
);

/**
 * آدرس پایه فایل‌ها (رسیدها، تصاویر، ...)
 */
export const PHP_FILE_BASE_URL = readEnv(
  "NEXT_PUBLIC_PHP_FILE_BASE_URL",
  "https://web120.ir/apartment"
);

/**
 * آدرس تصاویر اسلایدر خوش‌آمدگویی
 */
export const WELCOME_IMAGES_BASE_URL = readEnv(
  "NEXT_PUBLIC_WELCOME_IMAGES_URL",
  "https://web120.ir/apartment/picperesent"
);

// ============================================================
// Helper Functions
// ============================================================

/**
 * ساخت آدرس کامل یک فایل
 * مثال: buildFileUrl("resid/123.jpg")
 * → "https://web120.ir/apartment/resid/123.jpg"
 */
export function buildFileUrl(
  path: string
): string {
  if (!path || path === "0") return "";

  // اگر قبلاً کامل بود، همون رو برگردون
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  // حذف / اضافه در ابتدا
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;

  return `${PHP_FILE_BASE_URL}/${cleanPath}`;
}

/**
 * ساخت آدرس کامل یک تصویر اسلایدر
 * مثال: buildWelcomeImageUrl("1.png")
 * → "https://web120.ir/apartment/picperesent/1.png"
 */
export function buildWelcomeImageUrl(
  filename: string
): string {
  if (!filename) return "";

  if (filename.startsWith("http://") || filename.startsWith("https://")) {
    return filename;
  }

  const cleanName = filename.startsWith("/") ? filename.slice(1) : filename;

  return `${WELCOME_IMAGES_BASE_URL}/${cleanName}`;
}