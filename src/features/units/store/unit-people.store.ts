import { create } from "zustand";

interface UnitPeopleState {
  isSaving: boolean;

  error: string | null;

  setSaving: (
    saving: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clearError: () => void;
}

export const useUnitPeopleStore =
  create<UnitPeopleState>(
    (set) => ({
      isSaving: false,

      error: null,

      setSaving: (saving) =>
        set({
          isSaving: saving,
        }),

      setError: (error) =>
        set({
          error,
        }),

      clearError: () =>
        set({
          error: null,
        }),
    })
  );