import { create } from "zustand";

import type {
  ResidentHistory,
  HistoryState,
} from "../types/unit-history.types";

const initialState = {
  history: [],
  isLoading: false,
  isDeleting: false,
  error: null,
};

export const useUnitHistoryStore = create<HistoryState>((set) => ({
  ...initialState,

  setHistory: (history) =>
    set({ history, error: null }),

  addHistory: (history) =>
    set((state) => ({
      history: [...state.history, history],
      error: null,
    })),

  removeHistory: (idnaghsh) =>
    set((state) => ({
      history: state.history.filter(
        (item) => item.idnaghsh !== idnaghsh
      ),
      error: null,
    })),

  setLoading: (isLoading) =>
    set({ isLoading }),

  setError: (error) =>
    set({ error }),

  clear: () =>
    set(initialState),
}));