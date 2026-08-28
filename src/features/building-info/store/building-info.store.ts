import { create } from "zustand";

import type {
  BuildingInfoItem,
} from "../types/building-info.types";

interface BuildingInfoState {
  items: BuildingInfoItem[];

  isLoading: boolean;

  error: string | null;

  setItems: (
    items: BuildingInfoItem[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useBuildingInfoStore =
  create<BuildingInfoState>(
    (set) => ({
      items: [],

      isLoading: false,

      error: null,

      setItems: (items) =>
        set({
          items,
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
          items: [],
          isLoading: false,
          error: null,
        }),
    })
  );