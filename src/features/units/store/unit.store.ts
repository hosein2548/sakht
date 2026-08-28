import { create } from "zustand";

import type {
  UnitSummary,
} from "../types/unit.types";

interface UnitState {
  units: UnitSummary[];

  isLoading: boolean;

  error: string | null;

  setUnits: (
    units: UnitSummary[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useUnitStore =
  create<UnitState>((set) => ({
    units: [],

    isLoading: false,

    error: null,

    setUnits: (units) =>
      set({
        units,
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
        units: [],
        isLoading: false,
        error: null,
      }),
  }));