// src/core/store/auth.store.ts
// ============================================================
// تنها مرجع State احراز هویت در کل پروژه
// - این Store فقط مسئول State است، نه منطق تجاری
// - منطق تجاری در src/core/auth/auth.service.ts قرار دارد
// - از persist برای نگهداری کاربر بین refresh ها استفاده می‌کند
// ============================================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// Types
// ============================================================

export type UserRole = "modir" | "malek" | "saken" | null;

export interface AuthUser {
  iduser: string;
  nameuser: string;
  phone: string;
  role?: UserRole;
}

export interface AuthState {
  // ---------- State ----------
  user: AuthUser | null;
  phone: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: UserRole;

  /**
   * آیا persist کامل شده؟
   * برای جلوگیری از race condition در اولین render استفاده می‌شود.
   */
  hydrated: boolean;

  // ---------- Actions ----------
  setUser: (user: AuthUser | null) => void;
  setPhone: (phone: string | null) => void;
  setAuthenticated: (status: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setRole: (role: UserRole) => void;
  setHydrated: (hydrated: boolean) => void;

  /**
   * پاک کردن کامل State (بدون منطق تجاری).
   * برای logout از AuthService.logout() استفاده کنید.
   */
  reset: () => void;
}

// ============================================================
// Initial State
// ============================================================

const initialState = {
  user: null,
  phone: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null,
  hydrated: false,
} as const;

// ============================================================
// Store
// ============================================================

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      // ---------- Actions ----------

      setUser: (user) =>
        set({
          user,
          isAuthenticated: Boolean(user),
          role: user?.role ?? null,
          error: null,
        }),

      setPhone: (phone) => set({ phone, error: null }),

      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setRole: (role) => set({ role }),

      setHydrated: (hydrated) => set({ hydrated }),

      reset: () => set({ ...initialState, hydrated: true }),
    }),
    {
      name: "auth-storage",

      // فقط این فیلدها persist می‌شوند
      partialize: (state) => ({
        user: state.user,
        phone: state.phone,
        isAuthenticated: state.isAuthenticated,
        role: state.role,
      }),

      // اطلاع از اتمام rehydration
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);