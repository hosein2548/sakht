import { buildingApi } from "../api/building.api";
import { useBuildingStore } from "../store/building.store";

import {
  buildingContextStorage,
} from "../storage/building-context.storage";

import type {
  AuthUser,
} from "@/src/features/auth/types/auth.types";

export async function initializeUserContext(
  user: AuthUser
) {
  const result =
    await buildingApi.getUserBuildings(
      user.iduser
    );

  const store =
    useBuildingStore.getState();

  store.setBuildings(
    result.buildings
  );

  store.setPreviousManagerBuildings(
    result.previousManagerBuildings
  );

  store.setUnits(
    result.units
  );

  /*
   * اولویت اول:
   * اولین ساختمان
   */
  if (result.buildings.length > 0) {
    const building =
      result.buildings[0];

    store.selectBuilding(
      building
    );

    buildingContextStorage.save(
      buildingContextStorage.fromBuilding(
        building
      )
    );

    return {
      type: "building" as const,

      building,

      unit: null,

      previousManagerBuildings:
        result.previousManagerBuildings,
    };
  }

  /*
   * اگر ساختمان نداریم:
   * اولین واحد
   */
  if (result.units.length > 0) {
    const unit =
      result.units[0];

    store.selectUnit(
      unit
    );

    buildingContextStorage.save(
      buildingContextStorage.fromUnit(
        unit
      )
    );

    return {
      type: "unit" as const,

      building: null,

      unit,

      previousManagerBuildings:
        result.previousManagerBuildings,
    };
  }

  /*
   * هیچ ساختمان یا واحدی وجود ندارد.
   */
  return {
    type: "empty" as const,

    building: null,

    unit: null,

    previousManagerBuildings:
      result.previousManagerBuildings,
  };
}