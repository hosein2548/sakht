import { apiClient } from "@/src/core/api/client";
import { useAuthStore } from "@/src/core/store/auth.store";
import { useAppStore } from "@/src/core/store/app.store";
import type { AuthUser } from "@/src/core/store/auth.store";

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

export class AuthService {
  private static instance: AuthService;

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

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

      // استخراج زمان انقضا از پاسخ
      let expirySeconds = 120;
      const numberMatch = raw.match(/^ok(\d+)/);
      if (numberMatch && numberMatch[1]) {
        expirySeconds = parseInt(numberMatch[1]) * 60;
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

      // استخراج اطلاعات کاربر از پاسخ
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

      // ذخیره در Storeهای Zustand
      const authStore = useAuthStore.getState();
      const appStore = useAppStore.getState();

      authStore.setUser(user);
      authStore.setAuthenticated(true);
      appStore.setUser(user);

      // ذخیره در localStorage برای persist
      this.saveUserToStorage(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      console.error("[AuthService] verifyCode error:", error);
      return {
        success: false,
        message: "تایید کد با خطا مواجه شد.",
      };
    }
  }

  /**
   * ایجاد Session در سرور (HttpOnly Cookie)
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

      const data = await response.json();
      return {
        success: data.success || false,
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
   * بررسی وضعیت احراز هویت (همگام‌سازی)
   */
  async checkAuth(): Promise<AuthUser | null> {
    // اول از Storeها چک کن
    const authStore = useAuthStore.getState();
    const appStore = useAppStore.getState();

    if (authStore.isAuthenticated && authStore.user) {
      return authStore.user;
    }

    // اگر در Store نبود، از localStorage بخوان
    const stored = this.loadUserFromStorage();
    if (stored) {
      authStore.setUser(stored);
      authStore.setAuthenticated(true);
      appStore.setUser(stored);
      return stored;
    }

    // اگر هیچکدام نبود، Session رو چک کن (با سرور)
    const sessionUser = await this.validateSession();
    if (sessionUser) {
      authStore.setUser(sessionUser);
      authStore.setAuthenticated(true);
      appStore.setUser(sessionUser);
      this.saveUserToStorage(sessionUser);
      return sessionUser;
    }

    return null;
  }

  /**
   * خروج کاربر
   */
  async logout(): Promise<void> {
    const authStore = useAuthStore.getState();
    const appStore = useAppStore.getState();

    // پاک کردن Session در سرور
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
    } catch (error) {
      console.error("[AuthService] logout session error:", error);
    }

    // پاک کردن Storeها
    authStore.logout();
    appStore.clearUser();

    // پاک کردن localStorage
    this.clearUserFromStorage();

    // هدایت به لاگین
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }

  // ============ Private Methods ============

  private extractUserFromResponse(response: string, phone: string): AuthUser | null {
    try {
      const jsonStart = response.indexOf("[");
      if (jsonStart === -1) return null;

      const jsonText = response.substring(jsonStart);
      const data = JSON.parse(jsonText);

      if (!Array.isArray(data) || data.length === 0) return null;

      const item = data[0];
      if (!item?.iduser) return null;

      return {
        iduser: String(item.iduser),
        nameuser: String(item.nameuser || ""),
        phone,
        role: null,
      };
    } catch (error) {
      console.error("[AuthService] extractUser error:", error);
      return null;
    }
  }

  private async validateSession(): Promise<AuthUser | null> {
    try {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) return null;

      const data = await response.json();
      if (data.user) {
        return data.user;
      }
      return null;
    } catch {
      return null;
    }
  }

  private saveUserToStorage(user: AuthUser): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("sakhteman_user", JSON.stringify(user));
    } catch (error) {
      console.error("[AuthService] saveUser error:", error);
    }
  }

  private loadUserFromStorage(): AuthUser | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("sakhteman_user");
      if (!raw) return null;
      return JSON.parse(raw) as AuthUser;
    } catch {
      return null;
    }
  }

  private clearUserFromStorage(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("sakhteman_user");
    } catch (error) {
      console.error("[AuthService] clearUser error:", error);
    }
  }
}