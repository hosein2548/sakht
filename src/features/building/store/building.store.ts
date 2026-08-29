// src/features/building/store/building.store.ts
import { create } from "zustand";
import type {
  Building,
  PreviousManagerBuilding,
  Unit,
} from "../types/building.types";

import {
  buildingContextStorage,
} from "../storage/building-context.storage";

import { useRoleStore } from "./role.store";
import { useAuthStore } from "@/src/core/store/auth.store";

interface BuildingState {
  buildings: Building[];
  previousManagerBuildings: PreviousManagerBuilding[];
  units: Unit[];
  selectedBuilding: Building | null;
  selectedUnit: Unit | null;

  setBuildings: (buildings: Building[]) => void;
  setPreviousManagerBuildings: (buildings: PreviousManagerBuilding[]) => void;
  setUnits: (units: Unit[]) => void;
  selectBuilding: (building: Building) => void;
  selectUnit: (unit: Unit) => void;
  restoreStoredContext: () => void;
  clearBuildingContext: () => void;
  clearSelection: () => void;
}

export const useBuildingStore = create<BuildingState>((set, get) => ({
  buildings: [],
  previousManagerBuildings: [],
  units: [],
  selectedBuilding: null,
  selectedUnit: null,

  setBuildings: (buildings) =>
    set({
      buildings,
    }),

  setPreviousManagerBuildings: (previousManagerBuildings) =>
    set({
      previousManagerBuildings,
    }),

  setUnits: (units) =>
    set({
      units,
    }),

  selectBuilding: (building) => {
    console.log("🏗️ selectBuilding called:", building);
    
    buildingContextStorage.save(
      buildingContextStorage.fromBuilding(building)
    );

    // ✅ تنظیم نقش برای ساختمان (مدیر)
    const { user } = useAuthStore.getState();
    if (user) {
      useRoleStore.getState().setRoleForBuilding(user.iduser);
    }

    set({
      selectedBuilding: building,
      selectedUnit: null,
    });
  },

  selectUnit: (unit) => {
    console.log("🏢 selectUnit called:", unit);
    
    buildingContextStorage.save(
      buildingContextStorage.fromUnit(unit)
    );

    // ✅ تنظیم نقش‌ها بر اساس واحد انتخاب شده
    const { user } = useAuthStore.getState();
    if (user) {
      useRoleStore.getState().setRolesFromUnit(unit, user.iduser);
    }

    set({
      selectedBuilding: null,
      selectedUnit: unit,
    });
  },

  restoreStoredContext: () => {
    const stored = buildingContextStorage.load();
    console.log("🔄 restoreStoredContext called, stored:", stored);
    
    if (!stored) return;

    if (stored.ids && stored.idv === "") {
      const building: Building = {
        ids: stored.ids,
        names: stored.namesakhteman,
        idmodir: stored.modir === "yes" ? "" : "",
        namemodir: "",
        idcity: stored.idcity,
        namecity: stored.namecity,
        nameostan: stored.nameostan,
        codeostan: stored.codeostan,
      };

      // ✅ تنظیم نقش برای ساختمان
      const { user } = useAuthStore.getState();
      if (user) {
        useRoleStore.getState().setRoleForBuilding(user.iduser);
      }

      set({
        selectedBuilding: building,
        selectedUnit: null,
      });
      return;
    }

    if (stored.ids && stored.idv) {
      const unit: Unit = {
        idv: stored.idv,
        namev: stored.namevahed,
        malek: stored.malek === "yes" ? "stored" : "",
        saken: stored.saken === "yes" ? "stored" : "",
        idmodir: "",
        namemodir: "",
        ids: stored.ids,
        names: stored.namesakhteman,
        idcity: stored.idcity,
        namecity: stored.namecity,
        nameostan: stored.nameostan,
        codeostan: stored.codeostan,
      };

      // ✅ تنظیم نقش‌ها هنگام بازیابی از Storage
      const { user } = useAuthStore.getState();
      if (user) {
        useRoleStore.getState().setRolesFromUnit(unit, user.iduser);
      }

      set({
        selectedBuilding: null,
        selectedUnit: unit,
      });
    }
  },

  clearBuildingContext: () => {
    buildingContextStorage.clear();
    useRoleStore.getState().clearRoles();

    set({
      buildings: [],
      previousManagerBuildings: [],
      units: [],
      selectedBuilding: null,
      selectedUnit: null,
    });
  },

  clearSelection: () => {
    useRoleStore.getState().clearRoles();
    set({ selectedBuilding: null, selectedUnit: null });
  },
}));