const BUILDING_ID_KEY =
  "selected_building_id";

const UNIT_ID_KEY =
  "selected_unit_id";

export const buildingSelectionStorage = {
  saveBuilding(
    buildingId: string
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    localStorage.setItem(
      BUILDING_ID_KEY,
      buildingId
    );

    localStorage.removeItem(
      UNIT_ID_KEY
    );
  },

  saveUnit(
    unitId: string
  ) {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    localStorage.setItem(
      UNIT_ID_KEY,
      unitId
    );

    localStorage.removeItem(
      BUILDING_ID_KEY
    );
  },

  getBuildingId() {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    return localStorage.getItem(
      BUILDING_ID_KEY
    );
  },

  getUnitId() {
    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    return localStorage.getItem(
      UNIT_ID_KEY
    );
  },

  clear() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    localStorage.removeItem(
      BUILDING_ID_KEY
    );

    localStorage.removeItem(
      UNIT_ID_KEY
    );
  },
};