import { create } from "zustand";

interface UnitEditState {
  isSaving: boolean;

  error: string | null;

  success: boolean;

  setSaving: (
    saving: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  setSuccess: (
    success: boolean
  ) => void;

  reset: () => void;
}

export const useUnitEditStore =
  create<UnitEditState>((set) => ({
    isSaving: false,

    error: null,

    success: false,

    setSaving: (saving) =>
      set({
        isSaving: saving,
      }),

    setError: (error) =>
      set({
        error,
      }),

    setSuccess: (success) =>
      set({
        success,
      }),

    reset: () =>
      set({
        isSaving: false,
        error: null,
        success: false,
      }),
  }));