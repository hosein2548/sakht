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
        setIsLoading(true);
        console.log("🔐 SessionProvider: Initializing...");
        
        const authService = AuthService.getInstance();
        const userData = await authService.checkAuth();

        if (userData) {
          console.log("✅ SessionProvider: User found:", userData.iduser);
          setUser(userData);
          setAuthenticated(true);
          setAppUser(userData);
        } else {
          console.log("❌ SessionProvider: No user found");
        }
      } catch (error) {
        console.error("❌ SessionProvider: Init error:", error);
      } finally {
        console.log("🏁 SessionProvider: Loading finished");
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
      const userData = await AuthService.getInstance().checkAuth();
      if (userData) {
        setUser(userData);
        setAuthenticated(true);
        setAppUser(userData);
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