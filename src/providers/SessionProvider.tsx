// src/providers/SessionProvider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { AuthService } from "@/src/core/auth/auth.service";
import { useAuthStore } from "@/src/core/store/auth.store";
import { useAppStore } from "@/src/core/store/app.store";

interface SessionContextType {
  user: ReturnType<typeof useAuthStore>["user"];
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated, setUser, setAuthenticated } = useAuthStore();
  const { setUser: setAppUser } = useAppStore();

  useEffect(() => {
    const initSession = async () => {
      try {
        const authService = AuthService.getInstance();
        const user = await authService.checkAuth();

        if (user) {
          setUser(user);
          setAuthenticated(true);
          setAppUser(user);
        }
      } catch (error) {
        console.error("[SessionProvider] Init error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [setUser, setAuthenticated, setAppUser]);

  const logout = async () => {
    await AuthService.getInstance().logout();
  };

  const refresh = async () => {
    setIsLoading(true);
    try {
      const user = await AuthService.getInstance().checkAuth();
      if (user) {
        setUser(user);
        setAuthenticated(true);
        setAppUser(user);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        logout,
        refresh,
      }}
    >
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