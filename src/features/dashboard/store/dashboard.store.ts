import { create } from "zustand";

import type { MainInfo } from "../types/dashboard.types";

interface DashboardState {
  mainInfo: MainInfo | null;

  isLoading: boolean;

  error: string | null;

  setMainInfo: (
    info: MainInfo | null
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useDashboardStore =
  create<DashboardState>((set) => ({
    mainInfo: null,

    isLoading: false,

    error: null,
    
    setMainInfo: (info) =>
      set({
        mainInfo: info,
      }),

    setLoading: (loading) =>
      set({
        isLoading: loading,
      }),

    setError: (error) =>
      set({
        error,
      }),

    clear: () =>
      set({
        mainInfo: null,
        isLoading: false,
        error: null,
      }),
  }));