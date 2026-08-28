import { create } from "zustand";

import type {
  BuildingRule,
} from "../types/rule.types";

interface RuleState {
  rules: BuildingRule[];

  isLoading: boolean;

  error: string | null;

  setRules: (
    rules: BuildingRule[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useRuleStore =
  create<RuleState>((set) => ({
    rules: [],

    isLoading: false,

    error: null,

    setRules: (rules) =>
      set({
        rules,
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
        rules: [],
        isLoading: false,
        error: null,
      }),
  }));