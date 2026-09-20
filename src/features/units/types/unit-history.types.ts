// ============================================
// Types مربوط به سوابق ساکن
// ============================================

/**
 * یک رکورد از سوابق سکونت
 */
export interface ResidentHistory {
  /** شناسه واحد */
  idvahed: string;

  /** شناسه رکورد (برای حذف/ویرایش) */
  idnaghsh: string;

  /** تاریخ شروع سکونت */
  startDate: string;

  /** تاریخ پایان سکونت (خالی یا 1490/01/01 = تا کنون) */
  endDate: string;

  /** تعداد نفرات ساکن */
  count: string;

  /** وضعیت رکورد */
  status: 'active' | 'ended' | 'pending';

  /** شناسه کاربر */
  iduser: string;

  /** نام و نام خانوادگی (از API) */
  nameuser: string;

  /** شماره موبایل (از API) */
  phone: string;

  /** نقش: مالک یا ساکن */
  naghsh: 'مالک' | 'ساکن';
}

/**
 * پارامترهای دریافت سوابق
 */
export interface GetHistoryParams {
  unitId: string;
  /** شناسه کاربر (اجباری - چون سرور بر اساس idu کوئری می‌زنه) */
  userId: string;
  /** نقش کاربر: مالک یا ساکن */
  role?: "malek" | "saken";
}

/**
 * پارامترهای حذف رکورد
 */
export interface DeleteHistoryParams {
  /** شناسه رکورد */
  idnaghsh: string;
  
  /** تاریخ پایان (برای بستن دوره) */
  endDate: string;
}

/**
 * پاسخ API برای سوابق
 */
export interface HistoryResponse {
  success: boolean;
  data?: ResidentHistory[];
  message?: string;
}

/**
 * وضعیت سوابق در Store
 */
export interface HistoryState {
  /** لیست سوابق */
  history: ResidentHistory[];
  
  /** آیا در حال بارگذاری است */
  isLoading: boolean;
  
  /** آیا در حال حذف است */
  isDeleting: boolean;
  
  /** خطا */
  error: string | null;
  
  /** تنظیم سوابق */
  setHistory: (history: ResidentHistory[]) => void;
  
  /** افزودن سابقه */
  addHistory: (history: ResidentHistory) => void;
  
  /** حذف سابقه (از لیست) */
  removeHistory: (idnaghsh: string) => void;
  
  /** تنظیم بارگذاری */
  setLoading: (loading: boolean) => void;
  
  /** تنظیم خطا */
  setError: (error: string | null) => void;
  
  /** پاک کردن همه */
  clear: () => void;
}