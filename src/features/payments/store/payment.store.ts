import { create } from "zustand";

import type {
  Payment,
} from "../types/payment.types";

interface PaymentState {
  payments: Payment[];

  isLoading: boolean;

  error: string | null;

  setPayments: (
    payments: Payment[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const usePaymentStore =
  create<PaymentState>(
    (set) => ({
      payments: [],

      isLoading: false,

      error: null,

      setPayments: (
        payments
      ) =>
        set({
          payments,
        }),

      setLoading: (
        loading
      ) =>
        set({
          isLoading: loading,
        }),

      setError: (
        error
      ) =>
        set({
          error,
        }),

      clear: () =>
        set({
          payments: [],

          isLoading: false,

          error: null,
        }),
    })
  );