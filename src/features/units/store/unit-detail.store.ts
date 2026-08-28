import { create } from "zustand";

import type {
  UnitDetail,
  UnitPerson,
} from "../types/unit-detail.types";

interface UnitDetailState {
  selectedUnitId: string | null;

  detail: UnitDetail | null;

  people: UnitPerson[];

  isLoadingDetail: boolean;

  isLoadingPeople: boolean;

  detailError: string | null;

  peopleError: string | null;

  setSelectedUnitId: (
    unitId: string | null
  ) => void;

  setDetail: (
    detail: UnitDetail | null
  ) => void;

  setPeople: (
    people: UnitPerson[]
  ) => void;

  setLoadingDetail: (
    loading: boolean
  ) => void;

  setLoadingPeople: (
    loading: boolean
  ) => void;

  setDetailError: (
    error: string | null
  ) => void;

  setPeopleError: (
    error: string | null
  ) => void;

  clear: () => void;
}

export const useUnitDetailStore =
  create<UnitDetailState>(
    (set) => ({
      selectedUnitId: null,

      detail: null,

      people: [],

      isLoadingDetail: false,

      isLoadingPeople: false,

      detailError: null,

      peopleError: null,

      setSelectedUnitId: (
        unitId
      ) =>
        set({
          selectedUnitId: unitId,
        }),

      setDetail: (
        detail
      ) =>
        set({
          detail,
        }),

      setPeople: (
        people
      ) =>
        set({
          people,
        }),

      setLoadingDetail: (
        loading
      ) =>
        set({
          isLoadingDetail: loading,
        }),

      setLoadingPeople: (
        loading
      ) =>
        set({
          isLoadingPeople: loading,
        }),

      setDetailError: (
        error
      ) =>
        set({
          detailError: error,
        }),

      setPeopleError: (
        error
      ) =>
        set({
          peopleError: error,
        }),

      clear: () =>
        set({
          selectedUnitId: null,

          detail: null,

          people: [],

          isLoadingDetail: false,

          isLoadingPeople: false,

          detailError: null,

          peopleError: null,
        }),
    })
  );