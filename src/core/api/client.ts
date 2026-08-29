// src/core/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "/api/php",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "text/plain, application/json",
  },
});

// Interceptor برای مدیریت خطاهای احراز هویت
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // اگر خطای ۴۰۱ یا ۴۰۳ باشه، کاربر رو به لاگین هدایت کن
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        // استفاده از import dynamic برای جلوگیری از circular dependency
        import("@/src/core/auth/auth.service").then(({ AuthService }) => {
          AuthService.getInstance().logout();
        });
      }
    }
    return Promise.reject(error);
  }
);