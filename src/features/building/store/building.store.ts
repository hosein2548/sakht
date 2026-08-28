import { create } from "zustand";

import { persist } from "zustand/middleware";
import type {
  Building,
  PreviousManagerBuilding,
  Unit,
} from "../types/building.types";

import {
  buildingContextStorage,
} from "../storage/building-context.storage";

interface BuildingState {
  buildings: Building[];

  previousManagerBuildings:
    PreviousManagerBuilding[];

  units: Unit[];

  selectedBuilding:
    Building | null;

  selectedUnit:
    Unit | null;

  setBuildings: (
    buildings: Building[]
  ) => void;

  setPreviousManagerBuildings: (
    buildings:
      PreviousManagerBuilding[]
  ) => void;

  setUnits: (
    units: Unit[]
  ) => void;

  selectBuilding: (
    building: Building
  ) => void;

  selectUnit: (
    unit: Unit
  ) => void;

  restoreStoredContext: () => void;

  clearBuildingContext: () => void;
    clearSelection: () => void;
  
}

export const useBuildingStore =
  create<BuildingState>((set) => ({
    buildings: [],

    previousManagerBuildings: [],

    units: [],

    selectedBuilding: null,

    selectedUnit: null,

    setBuildings: (buildings) =>
      set({
        buildings,
      }),

    setPreviousManagerBuildings:
      (
        previousManagerBuildings
      ) =>
        set({
          previousManagerBuildings,
        }),

    setUnits: (units) =>
      set({
        units,
      }),

    selectBuilding: (
      building
    ) => {
      buildingContextStorage.save(
        buildingContextStorage.fromBuilding(
          building
        )
      );

      set({
        selectedBuilding:
          building,

        selectedUnit:
          null,
      });
    },

    selectUnit: (
      unit
    ) => {
      buildingContextStorage.save(
        buildingContextStorage.fromUnit(
          unit
        )
      );

      set({
        selectedBuilding:
          null,

        selectedUnit:
          unit,
      });
    },

    restoreStoredContext: () => {
      const stored =
        buildingContextStorage.load();

      if (!stored) {
        return;
      }

      /*
       * فعلاً فقط اطلاعات انتخاب‌شده
       * را از Storage بازسازی می‌کنیم.
       *
       * لیست کامل ساختمان و واحد
       * از API Bootstrap می‌آید.
       */

      if (
        stored.ids &&
        stored.idv === ""
      ) {
        const building: Building = {
          ids: stored.ids,
          names:
            stored.namesakhteman,

          idmodir:
            stored.modir === "yes"
              ? ""
              : "",

          namemodir: "",

          idcity:
            stored.idcity,

          namecity:
            stored.namecity,

          nameostan:
            stored.nameostan,

          codeostan:
            stored.codeostan,
        };

        set({
          selectedBuilding:
            building,

          selectedUnit:
            null,
        });

        return;
      }

      if (
        stored.ids &&
        stored.idv
      ) {
        const unit: Unit = {
          idv: stored.idv,
          namev:
            stored.namevahed,

          malek:
            stored.malek === "yes"
              ? "stored"
              : "",

          saken:
            stored.saken === "yes"
              ? "stored"
              : "",

          idmodir: "",
          namemodir: "",

          ids: stored.ids,
          names:
            stored.namesakhteman,

          idcity:
            stored.idcity,

          namecity:
            stored.namecity,

          nameostan:
            stored.nameostan,

          codeostan:
            stored.codeostan,
        };

        set({
          selectedBuilding:
            null,

          selectedUnit:
            unit,
        });
      }
    },

    clearBuildingContext: () => {
      buildingContextStorage.clear();

      set({
        buildings: [],

        previousManagerBuildings:
          [],

        units: [],

        selectedBuilding:
          null,

        selectedUnit:
          null,
      });
    },
    clearSelection: () => 
        set({ selectedBuilding: null, selectedUnit: null }),

    
  })
  );