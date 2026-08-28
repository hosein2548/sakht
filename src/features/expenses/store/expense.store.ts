import { create } from "zustand";

import type {
  Expense,
  ExpenseSplit,
} from "../types/expense.types";

interface ExpenseState {
  expenses: Expense[];

  selectedExpense:
    Expense | null;

  splitItems: ExpenseSplit[];

  isLoading: boolean;

  isLoadingSplit: boolean;

  error: string | null;

  splitError: string | null;

  setExpenses: (
    expenses: Expense[]
  ) => void;

  setSelectedExpense: (
    expense: Expense | null
  ) => void;

  setSplitItems: (
    items: ExpenseSplit[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setLoadingSplit: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  setSplitError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useExpenseStore =
  create<ExpenseState>(
    (set) => ({
      expenses: [],

      selectedExpense: null,

      splitItems: [],

      isLoading: false,

      isLoadingSplit: false,

      error: null,

      splitError: null,

      setExpenses: (
        expenses
      ) =>
        set({
          expenses,
        }),

      setSelectedExpense: (
        expense
      ) =>
        set({
          selectedExpense:
            expense,
        }),

      setSplitItems: (
        items
      ) =>
        set({
          splitItems: items,
        }),

      setLoading: (
        loading
      ) =>
        set({
          isLoading: loading,
        }),

      setLoadingSplit: (
        loading
      ) =>
        set({
          isLoadingSplit:
            loading,
        }),

      setError: (
        error
      ) =>
        set({
          error,
        }),

      setSplitError: (
        error
      ) =>
        set({
          splitError: error,
        }),

      clear: () =>
        set({
          expenses: [],

          selectedExpense:
            null,

          splitItems: [],

          isLoading: false,

          isLoadingSplit: false,

          error: null,

          splitError: null,
        }),
    })
  );