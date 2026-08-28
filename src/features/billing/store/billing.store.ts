import { create } from "zustand";

import type {
  BuildingBill,
  FundBillItem,
  UnitBillItem,
} from "../types/billing.types";

interface BillingState {
  buildingBills: BuildingBill[];

  unitBills: UnitBillItem[];

  fundBills: FundBillItem[];

  isLoading: boolean;

  error: string | null;

  setBuildingBills: (
    items: BuildingBill[]
  ) => void;

  setUnitBills: (
    items: UnitBillItem[]
  ) => void;

  setFundBills: (
    items: FundBillItem[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useBillingStore =
  create<BillingState>(
    (set) => ({
      buildingBills: [],

      unitBills: [],

      fundBills: [],

      isLoading: false,

      error: null,

      setBuildingBills: (
        items
      ) =>
        set({
          buildingBills: items,
        }),

      setUnitBills: (
        items
      ) =>
        set({
          unitBills: items,
        }),

      setFundBills: (
        items
      ) =>
        set({
          fundBills: items,
        }),

      setLoading: (
        loading
      ) =>
        set({
          isLoading:
            loading,
        }),

      setError: (
        error
      ) =>
        set({
          error,
        }),

      clear: () =>
        set({
          buildingBills: [],

          unitBills: [],

          fundBills: [],

          isLoading: false,

          error: null,
        }),
    })
  );