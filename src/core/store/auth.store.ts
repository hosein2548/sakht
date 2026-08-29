// src/core/store/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  iduser: string;
  nameuser: string;
  phone: string;
  role?: "modir" | "malek" | "saken" | null;
}

export interface AuthState {
  user: AuthUser | null;
  phone: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: "modir" | "malek" | "saken" | null;

  // Actions
  setUser: (user: AuthUser | null) => void;
  setPhone: (phone: string | null) => void;
  setAuthenticated: (status: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRole: (role: "modir" | "malek" | "saken" | null) => void;
  logout: () => void;
  clear: () => void;
}

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
          localStorage.removeItem("sakhteman_user");
          // حذف Session در سرور
          fetch("/api/auth/session", { method: "DELETE" }).catch(console.error);
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
    }
  )
);