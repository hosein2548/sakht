// src/components/layout/BuildingDrawer.tsx
"use client";

import { useMemo } from "react";

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
  const previousManagerBuildings = useBuildingStore((state) => state.previousManagerBuildings);
  const units = useBuildingStore((state) => state.units);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);
  const selectBuilding = useBuildingStore((state) => state.selectBuilding);
  const selectUnit = useBuildingStore((state) => state.selectUnit);

  const { user } = useAuthStore();
  const appUser = useAppStore((state) => state.user);

  // ============================================
  // Computed
  // ============================================
  const currentUser = user || appUser;
  const userId = currentUser?.iduser;

  // ✅ استخراج selectedBuildingId برای حل مشکل React Compiler
  const selectedBuildingId = useMemo(
    () => selectedBuilding?.ids,
    [selectedBuilding?.ids]
  );

  // ✅ ساختمان‌های تحت مدیریت
  const managedBuildings = useMemo(() => buildings, [buildings]);

  // ✅ ساختمان‌های مرتبط با واحدها (مالک/ساکن)
  const relatedBuildings = useMemo(() => previousManagerBuildings, [previousManagerBuildings]);

  // ✅ همه ساختمان‌های مرتبط (مدیریت + مالک/ساکن)
  const allBuildings = useMemo(() => {
    const all = [...managedBuildings];
    for (const item of relatedBuildings) {
      if (!all.some((b) => b.ids === item.ids)) {
        all.push({
          ...item,
        });
      }
    }
    return all;
  }, [managedBuildings, relatedBuildings]);

  // ✅ واحدهای مرتبط با کاربر (بر اساس ساختمان انتخاب شده یا همه)
  const unitItems = useMemo(() => {
    if (selectedBuildingId) {
      return units.filter((unit) => unit.ids === selectedBuildingId);
    }
    return units;
  }, [units, selectedBuildingId]);

  // ============================================
  // Handlers
  // ============================================
  const handleSelectBuilding = (building: (typeof allBuildings)[number]) => {
    selectBuilding(building);
    onOpenChange(false);
  };

  const handleSelectUnit = (unit: (typeof units)[number]) => {
    selectUnit(unit);
    onOpenChange(false);
  };

  const handleAddBuilding = () => {
    onOpenChange(false);
    window.location.href = "/buildings/new";
  };

  // ============================================
  // ✅ Helper Functions (اصلاح شده)
  // ============================================

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

    const badges: JSX.Element[] = [];

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
          {/* ساختمان‌های دارای واحد (مالک/ساکن)              */}
          {/* ================================================= */}
          {relatedBuildings.length > 0 && (
            <section className="border-b p-4">
              <div className="mb-3 flex items-center gap-2">
                <h2 className="text-sm font-bold">ساختمان‌های دارای واحد</h2>
                <span className="text-xs text-muted-foreground">
                  ({relatedBuildings.length})
                </span>
              </div>

              <div className="space-y-2">
                {relatedBuildings.map((building) => {
                  const isSelected = selectedBuilding?.ids === building.ids;
                  const buildingUnits = units.filter((u) => u.ids === building.ids);
                  
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
                          {buildingUnits.length} واحد
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
          {allBuildings.length === 0 && (
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
          {allBuildings.length > 0 && unitItems.length > 0 && (
            <div className="border-t" />
          )}

          {/* ================================================= */}
          {/* واحدها                                           */}
          {/* ================================================= */}
          {unitItems.length > 0 && (
            <section className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Home className="h-5 w-5" />
                <div>
                  <h2 className="text-sm font-bold">واحدهای من</h2>
                  <p className="text-xs text-muted-foreground">
                    {unitItems.length} واحد
                    {selectedBuilding && ` در ${selectedBuilding.names}`}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {unitItems.map((unit) => {
                  const isSelected = selectedUnit?.idv === unit.idv;
                  const roleBadges = getUnitRoleBadges(unit);
                  const roleText = getUnitRoleText(unit);
                  
                  // ✅ چک کردن اینکه آیا کاربر در این واحد هر دو نقش رو داره
                  const { isMalek, isSaken } = getUserRolesInUnit(unit);
                  const hasBoth = isMalek && isSaken;

                  return (
                    <button
                      key={`${unit.ids}-${unit.idv}`}
                      type="button"
                      onClick={() => handleSelectUnit(unit)}
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
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {/* ✅ نمایش بدج‌های نقش */}
                          {roleBadges}
                          {hasBoth && (
                            <span className="text-[10px] text-muted-foreground">
                              (هر دو نقش)
                            </span>
                          )}
                        </div>
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
          {/* اگر هیچ واحدی وجود نداشته باشد                   */}
          {/* ================================================= */}
          {allBuildings.length > 0 && unitItems.length === 0 && (
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