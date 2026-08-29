import { useRoleStore } from "@/src/features/building/store/role.store";
import { useAuthStore } from "@/src/core/store/auth.store";
import { useBuildingStore } from "@/src/features/building/store/building.store";

export function useRole() {
  const { currentRole, hasBothRoles, setCurrentRole } = useRoleStore();
  const { user } = useAuthStore();
  const { selectedUnit } = useBuildingStore();

  // بررسی اینکه آیا کاربر در واحد انتخاب شده نقش خاصی دارد
  const hasRole = (role: "malek" | "saken" | "modir"): boolean => {
    if (!user || !selectedUnit) return false;

    if (role === "modir") {
      return selectedUnit.idmodir === user.iduser;
    }
    if (role === "malek") {
      return selectedUnit.malek === user.iduser;
    }
    if (role === "saken") {
      return selectedUnit.saken === user.iduser;
    }
    return false;
  };

  // دریافت نقش‌های موجود کاربر در واحد فعلی
  const getAvailableRoles = (): ("malek" | "saken" | "modir")[] => {
    if (!user || !selectedUnit) return [];

    const roles: ("malek" | "saken" | "modir")[] = [];
    if (selectedUnit.idmodir === user.iduser) roles.push("modir");
    if (selectedUnit.malek === user.iduser) roles.push("malek");
    if (selectedUnit.saken === user.iduser) roles.push("saken");
    return roles;
  };

  // بررسی اینکه آیا کاربر نقش انتخاب شده را دارد
  const isCurrentRole = (role: "malek" | "saken" | "modir"): boolean => {
    return currentRole === role;
  };

  return {
    currentRole,
    hasBothRoles,
    setCurrentRole,
    hasRole,
    getAvailableRoles,
    isCurrentRole,
  };
}