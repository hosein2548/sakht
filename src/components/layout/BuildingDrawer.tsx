// src/components/layout/BuildingDrawer.tsx
"use client";

import { useMemo } from "react";
import React from "react";
import {
  Building2,
  Check,
  Home,
  Plus,
  User,
  Users,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import { useAuthStore } from "@/src/core/store/auth.store";
import { useAppStore } from "@/src/core/store/app.store";
import { useRoleStore } from "@/src/features/building/store/role.store";

interface BuildingDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BuildingDrawer({
  open,
  onOpenChange,
}: BuildingDrawerProps) {
  // ============================================
  // Store
  // ============================================
  const buildings = useBuildingStore((state) => state.buildings);
  const units = useBuildingStore((state) => state.units);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);
  const selectBuilding = useBuildingStore((state) => state.selectBuilding);
  const selectUnit = useBuildingStore((state) => state.selectUnit);

  const { user } = useAuthStore();
  const appUser = useAppStore((state) => state.user);
  const { currentRole, hasBothRoles, setCurrentRole } = useRoleStore();

  // ============================================
  // Computed
  // ============================================
  const currentUser = user || appUser;
  const userId = currentUser?.iduser;


  // فقط ساختمان‌هایی که خود کاربر مدیر آنهاست.
  const managedBuildings = useMemo(() => {
    const seen = new Set<string>();
    return buildings.filter((building) => {
      if (!building.ids || seen.has(building.ids)) return false;
      seen.add(building.ids);
      return true;
    });
  }, [buildings]);

  // همه واحدهای مرتبط با کاربر، مستقل از اینکه ساختمانشان تحت مدیریت کاربر هست یا نه.
  const unitItems = useMemo(() => {
    const seen = new Set<string>();
    return units.filter((unit) => {
      const key = `${unit.ids}-${unit.idv}`;
      if (!unit.ids || !unit.idv || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [units]);

  // واحدها بر اساس نقش کاربر، کاملاً جدا از ساختمان‌های تحت مدیریت.
  const ownerUnits = useMemo(
    () => unitItems.filter((unit) => unit.malek === userId),
    [unitItems, userId]
  );

  const residentUnits = useMemo(
    () => unitItems.filter((unit) => unit.saken === userId),
    [unitItems, userId]
  );

  const allBuildingsCount = managedBuildings.length;

  // ============================================
  // Handlers
  // ============================================
  const handleSelectBuilding = (building: (typeof managedBuildings)[number]) => {
    selectBuilding(building);
    onOpenChange(false);
  };

  const handleSelectUnit = (
    unit: (typeof units)[number],
    role: "malek" | "saken"
  ) => {
    selectUnit(unit);
    // نقش گروه انتخاب‌شده باید همان نقش فعال شود؛ مخصوصاً وقتی
    // کاربر در یک واحد هم مالک است و هم ساکن.
    setCurrentRole(role);
    onOpenChange(false);
  };

  const handleSwitchRole = (role: "malek" | "saken") => {
    setCurrentRole(role);
  };

  const handleAddBuilding = () => {
    onOpenChange(false);
  window.location.href = "/buildings/new";
  };

  // ✅ تشخیص نقش‌های کاربر در یک واحد خاص
  const getUserRolesInUnit = (unit: (typeof units)[number]) => {
    if (!userId) return { isMalek: false, isSaken: false, isModir: false };

    return {
      isMalek: unit.malek === userId,
      isSaken: unit.saken === userId,
      isModir: unit.idmodir === userId,
    };
  };

  // ✅ دریافت متن نقش برای نمایش
  const getUnitRoleText = (unit: (typeof units)[number]) => {
    const { isMalek, isSaken, isModir } = getUserRolesInUnit(unit);

    const roles: string[] = [];
    if (isModir) roles.push("مدیر");
    if (isMalek) roles.push("مالک");
    if (isSaken) roles.push("ساکن");

    if (roles.length === 0) return "واحد";
    return roles.join(" و ");
  };

  // ✅ دریافت بدج‌های نقش برای نمایش
  const getUnitRoleBadges = (unit: (typeof units)[number]) => {
    const { isMalek, isSaken, isModir } = getUserRolesInUnit(unit);

    //const badges: JSX.Element[] = [];
    const badges: React.ReactElement[] = [];
    if (isModir) {
      badges.push(
        <span key="modir" className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
          <Shield className="h-2.5 w-2.5" />
          مدیر
        </span>
      );
    }
    if (isMalek) {
      badges.push(
        <span key="malek" className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          <User className="h-2.5 w-2.5" />
          مالک
        </span>
      );
    }
    if (isSaken) {
      badges.push(
        <span key="saken" className="inline-flex items-center gap-0.5 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] text-success">
          <Users className="h-2.5 w-2.5" />
          ساکن
        </span>
      );
    }

    return badges;
  };

  // ============================================
  // Render
  // ============================================
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90%] max-w-md p-0">
        {/* ================================================= */}
        {/* Header                                           */}
        {/* ================================================= */}
        <SheetHeader className="border-b px-5 py-5">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            ساختمان و واحد
          </SheetTitle>
          {currentUser && (
            <p className="mt-1 text-xs text-muted-foreground">
              کاربر: {currentUser.nameuser}
            </p>
          )}
        </SheetHeader>

        <div className="h-[calc(100vh-5rem)] overflow-y-auto">
          {/* ================================================= */}
          {/* انتخاب نقش (فقط در صورتی که کاربر هم مالک و هم ساکن باشد) */}
          {/* ================================================= */}
          {selectedUnit && hasBothRoles && currentUser && (
            <section className="border-b bg-muted/30 p-4">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  انتخاب نقش در واحد {selectedUnit.namev}:
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleSwitchRole("malek")}
                    className={[
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      currentRole === "malek"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted",
                    ].join(" ")}
                  >
                    <User className="h-4 w-4" />
                    مالک
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchRole("saken")}
                    className={[
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition",
                      currentRole === "saken"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-muted",
                    ].join(" ")}
                  >
                    <Users className="h-4 w-4" />
                    ساکن
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentRole === "malek" && "✅ در حال نمایش اطلاعات با نقش مالک"}
                  {currentRole === "saken" && "✅ در حال نمایش اطلاعات با نقش ساکن"}
                  {!currentRole && "⚠️ لطفاً نقش خود را انتخاب کنید"}
                </p>
              </div>
            </section>
          )}

          {/* ================================================= */}
          {/* ساختمان‌های تحت مدیریت                         */}
          {/* ================================================= */}
          {managedBuildings.length > 0 && (
            <section className="border-b p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold">ساختمان‌های تحت مدیریت</h2>
                  <p className="text-xs text-muted-foreground">
                    {managedBuildings.length} ساختمان
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddBuilding}
                >
                  <Plus className="ml-2 h-4 w-4" />
                  افزودن
                </Button>
              </div>

              <div className="space-y-2">
                {managedBuildings.map((building) => {
                  const isSelected = selectedBuilding?.ids === building.ids;
                  return (
                    <button
                      key={building.ids}
                      type="button"
                      onClick={() => handleSelectBuilding(building)}
                      className={[
                        "flex w-full items-center gap-3 rounded-xl border p-4 text-right transition",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "hover:bg-muted",
                      ].join(" ")}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{building.names}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          نقش: مدیر
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-5 w-5 shrink-0 text-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ================================================= */}
          {/* اگر هیچ ساختمانی وجود نداشته باشد               */}
          {/* ================================================= */}
          {allBuildingsCount === 0 && (
            <section className="p-4">
              <div className="rounded-xl border border-dashed p-8 text-center">
                <Building2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
                <p className="font-semibold">هیچ ساختمانی یافت نشد</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  شما در هیچ ساختمانی نقش مدیریت، مالکیت یا سکونت ندارید.
                </p>
                <Button type="button" className="mt-4" onClick={handleAddBuilding}>
                  <Plus className="ml-2 h-4 w-4" />
                  ایجاد ساختمان جدید
                </Button>
              </div>
            </section>
          )}

          {/* ================================================= */}
          {/* جداکننده                                        */}
          {/* ================================================= */}
          {allBuildingsCount > 0 && unitItems.length > 0 && (
            <div className="border-t" />
          )}

          {/* ================================================= */}
          {/* واحدهای مرتبط با کاربر                            */}
          {/* ================================================= */}
          {unitItems.length > 0 && (
            <section className="p-4">
              <div className="mb-4 flex items-center gap-2">
                <Home className="h-5 w-5" />
                <div>
                  <h2 className="text-sm font-bold">واحدهای مرتبط با من</h2>
                  <p className="text-xs text-muted-foreground">
                    {unitItems.length} واحد در تمام ساختمان‌ها
                  </p>
                </div>
              </div>

              {ownerUnits.length > 0 && (
                <div className="mb-5">
                  <div className="mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    <h3 className="text-xs font-bold">واحدهای تحت مالکیت من</h3>
                    <span className="text-[10px] text-muted-foreground">
                      ({ownerUnits.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {ownerUnits.map((unit) => {
                      const isSelected =
                        selectedUnit?.ids === unit.ids &&
                        selectedUnit?.idv === unit.idv &&
                        currentRole === "malek";

                      return (
                        <button
                          key={`owner-${unit.ids}-${unit.idv}`}
                          type="button"
                          onClick={() => handleSelectUnit(unit, "malek")}
                          className={[
                            "flex w-full items-center gap-3 rounded-xl border p-4 text-right transition",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "hover:bg-muted",
                          ].join(" ")}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Home className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                              ساختمان: {unit.names}
                            </p>
                            <p className="mt-1 truncate font-semibold">
                              واحد {unit.namev}
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              <User className="h-2.5 w-2.5" />
                              مالک
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {residentUnits.length > 0 && (
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4 text-success" />
                    <h3 className="text-xs font-bold">واحدهای محل سکونت من</h3>
                    <span className="text-[10px] text-muted-foreground">
                      ({residentUnits.length})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {residentUnits.map((unit) => {
                      const isSelected =
                        selectedUnit?.ids === unit.ids &&
                        selectedUnit?.idv === unit.idv &&
                        currentRole === "saken";

                      return (
                        <button
                          key={`resident-${unit.ids}-${unit.idv}`}
                          type="button"
                          onClick={() => handleSelectUnit(unit, "saken")}
                          className={[
                            "flex w-full items-center gap-3 rounded-xl border p-4 text-right transition",
                            isSelected
                              ? "border-primary bg-primary/10"
                              : "hover:bg-muted",
                          ].join(" ")}
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Home className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">
                              ساختمان: {unit.names}
                            </p>
                            <p className="mt-1 truncate font-semibold">
                              واحد {unit.namev}
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 text-[10px] text-success">
                              <Users className="h-2.5 w-2.5" />
                              ساکن
                            </span>
                          </div>
                          {isSelected && (
                            <Check className="h-5 w-5 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* ================================================= */}
          {/* اگر هیچ واحدی وجود نداشته باشد                   */}
          {/* ================================================= */}
          {allBuildingsCount > 0 && unitItems.length === 0 && (
            <section className="p-4">
              <div className="rounded-xl border border-dashed p-6 text-center">
                <Home className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {selectedBuilding 
                    ? `هیچ واحدی در ${selectedBuilding.names} برای شما ثبت نشده است.`
                    : "هیچ واحدی برای شما ثبت نشده است."}
                </p>
              </div>
            </section>
          )}

          {/* ================================================= */}
          {/* Footer                                           */}
          {/* ================================================= */}
          <div className="border-t p-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() => onOpenChange(false)}
            >
              بستن
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}