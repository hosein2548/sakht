import type {
  Building,
  Unit,
} from "../types/building.types";

const KEY = "sakhteman_building_context";

export interface StoredBuildingContext {
  ids: string;
  idv: string;

  malek: string;
  saken: string;
  modir: string;

  idcity: string;
  namecity: string;
  nameostan: string;
  codeostan: string;

  namesakhteman: string;
  namevahed: string;
}

export const buildingContextStorage = {
  save(
    context: StoredBuildingContext
  ) {
    localStorage.setItem(
      KEY,
      JSON.stringify(context)
    );
  },

  load():
    StoredBuildingContext | null {
    const value =
      localStorage.getItem(KEY);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(
        value
      ) as StoredBuildingContext;
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(KEY);
  },

  fromBuilding(
    building: Building
  ): StoredBuildingContext {
    return {
      ids: building.ids,
      idv: "",

      malek: "",
      saken: "",
      modir: "yes",

      idcity: building.idcity,
      namecity: building.namecity,
      nameostan: building.nameostan,
      codeostan: building.codeostan,

      namesakhteman: building.names,
      namevahed: "",
    };
  },

  fromUnit(
    unit: Unit
  ): StoredBuildingContext {
    return {
      ids: unit.ids,
      idv: unit.idv,

      malek:
        unit.malek !== ""
          ? "yes"
          : "",

      saken:
        unit.saken !== ""
          ? "yes"
          : "",

      modir: "",

      idcity: unit.idcity,
      namecity: unit.namecity,
      nameostan: unit.nameostan,
      codeostan: unit.codeostan,

      namesakhteman: unit.names,
      namevahed: unit.namev,
    };
  },
};