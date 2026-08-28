// ============================================
// Types مربوط به کاربر و احراز هویت
// ============================================

/**
 * اطلاعات کاربر
 */
export interface AuthUser {
  iduser: string;
  nameuser: string;
  phone: string;
  role?: 'modir' | 'malek' | 'saken' | null;
}

/**
 * پاسخ ارسال کد
 */
export interface SendCodeResponse {
  success: boolean;
  message?: string;
  expirySeconds: number; // زمان انقضا به ثانیه
}

/**
 * پاسخ تایید کد
 */
export interface VerifyCodeResponse {
  success: boolean;
  message?: string;
  user?: AuthUser;
}

/**
 * وضعیت احراز هویت در Store
 */
export interface AuthState {
  user: AuthUser | null;
  phone: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: 'modir' | 'malek' | 'saken' | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setPhone: (phone: string | null) => void;
  setAuthenticated: (status: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRole: (role: 'modir' | 'malek' | 'saken' | null) => void;
  clear: () => void;
  logout: () => void; 
}

/**
 * پاسخ ورود از سرور (برای parse کردن)
 */
export interface LoginRawResponse {
  iduser: string;
  nameuser: string;
  phone?: string;
}

/**
 * پارامترهای ارسال کد
 */
export interface SendCodeParams {
  phone: string;
}

/**
 * پارامترهای تایید کد
 */
export interface VerifyCodeParams {
  phone: string;
  code: string;
}