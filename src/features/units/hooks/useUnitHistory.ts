import { useState, useCallback } from "react";

import {
  useUnitHistoryStore,
} from "../store/unit-history.store";

import {
  unitHistoryApi,
} from "../api/unit-history.api";

import type {
  ResidentHistory,
  GetHistoryParams,
} from "../types/unit-history.types";

interface UseUnitHistoryResult {
  /** لیست سوابق */
  history: ResidentHistory[];
  
  /** آیا در حال بارگذاری است */
  isLoading: boolean;
  
  /** آیا در حال حذف است */
  isDeleting: boolean;
  
  /** خطا */
  error: string | null;
  
  /** دریافت سوابق */
  loadHistory: (params: GetHistoryParams) => Promise<void>;
  
  /** پایان دادن به دوره سکونت */
  endHistory: (
    idnaghsh: string,
    endDate: string
  ) => Promise<boolean>;
  
  /** پاک کردن خطا */
  clearError: () => void;
}

/**
 * هاک مدیریت سوابق ساکن
 */
export function useUnitHistory(): UseUnitHistoryResult {
  const {
    history,
    isLoading,
    isDeleting,
    error,
    setHistory,
    removeHistory,
    setLoading,
    setError,
    clear,
  } = useUnitHistoryStore();

  /**
   * دریافت سوابق
   */
  const loadHistory = useCallback(
    async (params: GetHistoryParams) => {
      setLoading(true);
      setError(null);

      try {
        const result = await unitHistoryApi.getHistory(params);
        setHistory(result);
      } catch (requestError) {
        console.error("Load history error:", requestError);
        setError("دریافت سوابق با خطا مواجه شد.");
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError, setHistory]
  );

  /**
   * پایان دادن به دوره سکونت
   */
  const endHistory = useCallback(
    async (idnaghsh: string, endDate: string): Promise<boolean> => {
      try {
        const result = await unitHistoryApi.endHistory({
          idnaghsh,
          endDate,
        });

        if (result.success) {
          // حذف از لیست (یا آپدیت وضعیت)
          removeHistory(idnaghsh);
          return true;
        }

        setError(result.message || "خطا در پایان سکونت.");
        return false;

      } catch (requestError) {
        console.error("End history error:", requestError);
        setError("پایان سکونت با خطا مواجه شد.");
        return false;
      }
    },
    [removeHistory, setError]
  );

  /**
   * پاک کردن خطا
   */
  const clearError = useCallback(() => {
    setError(null);
  }, [setError]);

  return {
    history,
    isLoading,
    isDeleting,
    error,
    loadHistory,
    endHistory,
    clearError,
  };
}