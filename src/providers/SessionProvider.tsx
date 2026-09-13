// src/providers/SessionProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/src/core/auth/auth.service";
import { useAuthStore } from "@/src/core/store/auth.store";
import { useAppStore } from "@/src/core/store/app.store";
import type { AuthUser } from "@/src/core/store/auth.store";

interface SessionContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isInitializing, setIsInitializing] = useState(true);

  // انتخاب‌های دقیق از Store (جلوگیری از re-render اضافه)
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hydrated = useAuthStore((s) => s.hydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const setAppUser = useAppStore((s) => s.setUser);

  // انتظار برای اتمام persist و سپس بررسی Session
  useEffect(() => {
    if (!hydrated) return;

    const initSession = async () => {
      try {
        setIsInitializing(true);
        console.log("🔐 SessionProvider: Initializing...");

        const authService = AuthService.getInstance();
        const userData = await authService.checkAuth();

        if (userData) {
          console.log("✅ SessionProvider: User found:", userData.iduser);
          setUser(userData);
          setAppUser(userData);
        } else {
          console.log("❌ SessionProvider: No user found");
        }
      } catch (error) {
        console.error("❌ SessionProvider: Init error:", error);
      } finally {
        console.log("🏁 SessionProvider: Loading finished");
        setIsInitializing(false);
      }
    };

    void initSession();
  }, [hydrated, setUser, setAppUser]);

  const logout = async () => {
    await AuthService.getInstance().logout();
  };

  const refresh = async () => {
    setIsInitializing(true);
    try {
      const userData = await AuthService.getInstance().checkAuth();
      if (userData) {
        setUser(userData);
        setAppUser(userData);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  const contextValue: SessionContextType = {
    user: user ?? null,
    isAuthenticated,
    isLoading: isInitializing || !hydrated,
    logout,
    refresh,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
}