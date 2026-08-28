import { create } from "zustand";

import type {
  ContractItem,
} from "../types/contract.types";

interface ContractStateStore {
  contracts: ContractItem[];

  isLoading: boolean;

  error: string | null;

  setContracts: (
    contracts: ContractItem[]
  ) => void;

  setLoading: (
    loading: boolean
  ) => void;

  setError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useContractStore =
  create<ContractStateStore>(
    (set) => ({
      contracts: [],

      isLoading: false,

      error: null,

      setContracts: (
        contracts
      ) =>
        set({
          contracts,
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
          contracts: [],

          isLoading: false,

          error: null,
        }),
    })
  );