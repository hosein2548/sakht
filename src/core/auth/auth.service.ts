// src/core/auth/auth.service.ts
// ============================================================
// سرویس مرکزی احراز هویت
// - همه منطق تجاری اینجاست (fetch, parse, storage session)
// - State مدیریت‌شده در src/core/store/auth.store.ts
// ============================================================

import { apiClient } from "@/src/core/api/client";
import { useAuthStore } from "@/src/core/store/auth.store";
import { useAppStore } from "@/src/core/store/app.store";
import type { AuthUser } from "@/src/core/store/auth.store";

// ============================================================
// Types
// ============================================================

export interface LoginResponse {
  success: boolean;
  user?: AuthUser;
  message?: string;
  expirySeconds?: number;
}

export interface SessionResponse {
  success: boolean;
  message?: string;
}

// ============================================================
// Service
// ============================================================

export class AuthService {
  private static instance: AuthService | null = null;

  private constructor() {}

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // ==========================================================
  // Public API
  // ==========================================================

  /**
   * ارسال کد تایید به شماره موبایل
   */
  async sendCode(phone: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<string>("/login.php", {
        phonenumber: phone,
        statephp: "checkphone",
      });

      const raw = String(response.data ?? "");

      if (!raw.startsWith("ok")) {
        return {
          success: false,
          message: "شماره موبایل مورد قبول نیست.",
        };
      }

      // استخراج زمان انقضا از پاسخ: ok120...
      let expirySeconds = 120;
      const match = raw.match(/^ok(\d+)/);
      if (match?.[1]) {
        expirySeconds = parseInt(match[1], 10) * 60;
      }

      return {
        success: true,
        message: "کد تایید با موفقیت ارسال شد.",
        expirySeconds,
      };
    } catch (error) {
      console.error("[AuthService] sendCode error:", error);
      return {
        success: false,
        message: "ارسال کد با خطا مواجه شد.",
      };
    }
  }

  /**
   * تایید کد و ورود کاربر
   */
  async verifyCode(phone: string, code: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post<string>("/login.php", {
        mycode: code,
        myphone: phone,
        statephp: "checkcode",
      });

      const raw = String(response.data ?? "");

      if (raw === "no" || raw === "false" || !raw.startsWith("ok")) {
        return {
          success: false,
          message: "کد وارد شده صحیح نیست.",
        };
      }

      const user = this.extractUserFromResponse(raw, phone);
      if (!user) {
        return {
          success: false,
          message: "دریافت اطلاعات کاربر با خطا مواجه شد.",
        };
      }

      // ایجاد Session در سرور
      const sessionResult = await this.createSession();
      if (!sessionResult.success) {
        return {
          success: false,
          message: sessionResult.message || "ایجاد نشست کاربری ناموفق بود.",
        };
      }

      // ذخیره در Store
      const authStore = useAuthStore.getState();
      const appStore = useAppStore.getState();

      authStore.setUser(user);
      appStore.setUser(user);

      return { success: true, user };
    } catch (error) {
      console.error("[AuthService] verifyCode error:", error);
      return {
        success: false,
        message: "تایید کد با خطا مواجه شد.",
      };
    }
  }

  /**
   * ایجاد Session HttpOnly در سرور
   */
  async createSession(): Promise<SessionResponse> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        return {
          success: false,
          message: "ایجاد نشست کاربری ناموفق بود.",
        };
      }

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      return {
        success: Boolean(data.success),
        message: data.message,
      };
    } catch (error) {
      console.error("[AuthService] createSession error:", error);
      return {
        success: false,
        message: "ارتباط با سرور برای ایجاد نشست برقرار نشد.",
      };
    }
  }

  /**
   * بررسی وضعیت احراز هویت
   * اولویت: Store → Session سرور
   */
  async checkAuth(): Promise<AuthUser | null> {
    const authStore = useAuthStore.getState();

    // 1) اگر در Store هست
    if (authStore.isAuthenticated && authStore.user) {
      return authStore.user;
    }

    // 2) اگر در Session سرور هست
    const sessionUser = await this.validateSession();
    if (sessionUser) {
      const appStore = useAppStore.getState();
      authStore.setUser(sessionUser);
      appStore.setUser(sessionUser);
      return sessionUser;
    }

    return null;
  }

  /**
   * خروج کاربر (تنها نقطه خروج)
   * - حذف Session سرور
   * - پاک کردن Store
   * - هدایت به صفحه ورود
   */
  async logout(): Promise<void> {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("[AuthService] logout session error:", error);
    }

    // پاک کردن Storeها
    useAuthStore.getState().reset();
    useAppStore.getState().clearUser();

    // هدایت به صفحه ورود
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // ==========================================================
  // Private Helpers
  // ==========================================================

  /**
   * استخراج اطلاعات کاربر از پاسخ متنی سرور
   * فرمت: ok[{...}]
   */
  private extractUserFromResponse(
    response: string,
    phone: string
  ): AuthUser | null {
    try {
      const jsonStart = response.indexOf("[");
      if (jsonStart === -1) return null;

      const data = JSON.parse(response.substring(jsonStart)) as unknown;

      if (!Array.isArray(data) || data.length === 0) return null;

      const item = data[0] as Record<string, unknown>;
      if (!item?.iduser) return null;

      const role =
        item.role === "modir" ||
        item.role === "malek" ||
        item.role === "saken"
          ? item.role
          : null;

      return {
        iduser: String(item.iduser),
        nameuser: String(item.nameuser ?? ""),
        phone,
        role,
      };
    } catch (error) {
      console.error("[AuthService] extractUser error:", error);
      return null;
    }
  }

  /**
   * بررسی Session در سرور
   */
  private async validateSession(): Promise<AuthUser | null> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) return null;

      const data = (await response.json()) as { user?: AuthUser };
      return data.user ?? null;
    } catch {
      return null;
    }
  }
}