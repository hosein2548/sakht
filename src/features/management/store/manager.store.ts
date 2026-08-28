import { create } from "zustand";

import type {
  Manager,
} from "../types/manager.types";

interface ManagerState {
  managers: Manager[];

  isLoading: boolean;

  error: string | null;

  setManagers: (
    managers: Manager[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useManagerStore =
  create<ManagerState>((set) => ({
    managers: [],

    isLoading: false,

    error: null,

    setManagers: (managers) =>
      set({
        managers,
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
        managers: [],

        isLoading: false,

        error: null,
      }),
  }));