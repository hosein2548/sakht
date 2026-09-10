import { buildingApi } from "../api/building.api";

export interface UserAccessResult {
  hasRole: boolean;
  isManager: boolean;
  isOwner: boolean;
  isResident: boolean;
}

export async function checkUserAccess(
  userId: string
): Promise<UserAccessResult> {
  const result = await buildingApi.getUserBuildings(userId);

  const isManager = result.buildings.length > 0;
  const isOwner = result.units.some(
    (unit) => unit.malek === userId
  );
  const isResident = result.units.some(
    (unit) => unit.saken === userId
  );

  return {
    hasRole:
      isManager ||
      isOwner ||
      isResident,

    isManager,
    isOwner,
    isResident,
  };
}