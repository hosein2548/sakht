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
  
  /** تاریخ پایان سکونت (خالی = تا کنون) */
  endDate: string;
  
  /** تعداد نفرات ساکن */
  count: string;
  
  /** وضعیت رکورد (برای نمایش دکمه حذف) */
  status: 'active' | 'ended' | 'pending';
}

/**
 * پارامترهای دریافت سوابق
 */
export interface GetHistoryParams {
  /** شناسه واحد */
  unitId: string;
  
  /** شناسه کاربر (ساکن) */
  userId: string;
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