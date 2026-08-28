// src/features/auth/store/auth.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser, AuthState } from "../types/auth.types";

const initialState = {
  user: null,
  phone: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setPhone: (phone) => set({ phone, error: null }),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setRole: (role) => set({ role }),

      logout: () => {
        set({ ...initialState });
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
          localStorage.removeItem("building-selection");
          void fetch("/api/auth/session", { method: "DELETE" }).catch((error) => {
            console.error("Logout session cleanup failed:", error);
          });
        }
      },

      clear: () => set({ ...initialState }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),
      // ✅ افزودن onRehydrateStorage برای دیباگ
      onRehydrateStorage: () => {
        console.log("🔄 Auth store rehydrating...");
        return (state, error) => {
          if (error) {
            console.error("❌ Auth store rehydration error:", error);
          } else {
            console.log("✅ Auth store rehydrated:", state);
          }
        };
      },
    }
  )
);