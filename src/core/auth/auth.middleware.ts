// src/core/auth/auth.middleware.ts
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { AuthService } from "./auth.service";
import { useAuthStore } from "@/src/core/store/auth.store";

const PUBLIC_PATHS = ["/login", "/login/otp"];

export function useAuthMiddleware() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const authStore = useAuthStore();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isPublic = PUBLIC_PATHS.some((path) => pathname?.startsWith(path));

        // بررسی وضعیت احراز هویت
        const user = await AuthService.getInstance().checkAuth();
        const authenticated = !!user;

        setIsAuthenticated(authenticated);

        // اگر کاربر احراز هویت شده و در صفحه عمومی هست → برو به داشبورد
        if (authenticated && isPublic) {
          router.replace("/dashboard");
          return;
        }

        // اگر کاربر احراز هویت نشده و در صفحه خصوصی هست → برو به لاگین
        if (!authenticated && !isPublic) {
          router.replace(`/login?redirect=${encodeURIComponent(pathname || "")}`);
          return;
        }
      } catch (error) {
        console.error("[AuthMiddleware] Error:", error);
        // در صورت خطا، کاربر رو به لاگین بفرست
        if (!PUBLIC_PATHS.some((path) => pathname?.startsWith(path))) {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [pathname, router]);

  return { isLoading, isAuthenticated };
}