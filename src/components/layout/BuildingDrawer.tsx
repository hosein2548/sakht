"use client";

import { useMemo } from "react";

import {
  Building2,
  Check,
  Home,
  Plus,
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

interface BuildingDrawerProps {
  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;
}

export default function BuildingDrawer({
  open,
  onOpenChange,
}: BuildingDrawerProps) {
  /*
   * =====================================================
   * Building Store
   * =====================================================
   */

  const buildings =
    useBuildingStore(
      (state) =>
        state.buildings
    );

  const units =
    useBuildingStore(
      (state) =>
        state.units
    );

  const selectedBuilding =
    useBuildingStore(
      (state) =>
        state.selectedBuilding
    );

  const selectedUnit =
    useBuildingStore(
      (state) =>
        state.selectedUnit
    );

  const selectBuilding =
    useBuildingStore(
      (state) =>
        state.selectBuilding
    );

  const selectUnit =
    useBuildingStore(
      (state) =>
        state.selectUnit
    );

  /*
   * =====================================================
   * ساختمان‌ها
   * =====================================================
   */

  const buildingItems =
    useMemo(() => {
      return buildings;
    }, [buildings]);

  /*
   * =====================================================
   * واحدها
   *
   * واحدهایی که متعلق به ساختمان انتخاب‌شده هستند
   * نمایش داده می‌شوند.
   * =====================================================
   */

  const unitItems =
    useMemo(() => {
      if (
        selectedBuilding?.ids
      ) {
        return units.filter(
          (unit) =>
            unit.ids ===
            selectedBuilding.ids
        );
      }

      return units;
    }, [
      units,
      selectedBuilding?.ids,
    ]);

  /*
   * =====================================================
   * انتخاب ساختمان
   * =====================================================
   */

  const handleSelectBuilding = (
    building: (typeof buildings)[number]
  ) => {
    /*
     * انتخاب ساختمان از طریق Store.
     *
     * Store خودش:
     * 1. ساختمان انتخاب‌شده را در State قرار می‌دهد.
     * 2. واحد قبلی را null می‌کند.
     * 3. Context را در Storage ذخیره می‌کند.
     */
    selectBuilding(
      building
    );

    /*
     * Drawer بسته شود.
     */
    onOpenChange(false);
  };

  /*
   * =====================================================
   * انتخاب واحد
   * =====================================================
   */

  const handleSelectUnit = (
    unit: (typeof units)[number]
  ) => {
    /*
     * انتخاب واحد از طریق Store.
     *
     * Store خودش:
     * 1. واحد انتخاب‌شده را در State قرار می‌دهد.
     * 2. ساختمان انتخاب‌شده را null می‌کند.
     * 3. Context را در Storage ذخیره می‌کند.
     */
    selectUnit(
      unit
    );

    /*
     * Drawer بسته شود.
     */
    onOpenChange(false);
  };

  /*
   * =====================================================
   * ایجاد ساختمان جدید
   * =====================================================
   */

  const handleAddBuilding =
    () => {
      /*
       * این مسیر را در مرحله ساخت ساختمان
       * به صفحه واقعی ایجاد ساختمان وصل می‌کنیم.
       */
      onOpenChange(false);

      window.location.href =
        "/buildings/new";
    };

  return (
    <Sheet
      open={open}
      onOpenChange={
        onOpenChange
      }
    >
      <SheetContent
        side="right"
        className="w-[90%] max-w-md p-0"
      >
        {/* ================================================= */}
        {/* Header                                           */}
        {/* ================================================= */}

        <SheetHeader className="border-b px-5 py-5">
          <SheetTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />

            ساختمان و واحد
          </SheetTitle>
        </SheetHeader>

        <div className="h-[calc(100vh-5rem)] overflow-y-auto">

          {/* ================================================= */}
          {/* ساختمان‌ها                                       */}
          {/* ================================================= */}

          <section className="p-4">

            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-bold">
                ساختمان‌های تحت مدیریت
              </h2>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={
                  handleAddBuilding
                }
              >
                <Plus className="ml-2 h-4 w-4" />

                افزودن
              </Button>
            </div>

            {buildingItems.length ===
            0 ? (
              <div className="rounded-xl border border-dashed p-5 text-center">
                <Building2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  ساختمانی وجود ندارد.
                </p>

                <Button
                  type="button"
                  className="mt-4"
                  onClick={
                    handleAddBuilding
                  }
                >
                  <Plus className="ml-2 h-4 w-4" />

                  ایجاد ساختمان
                </Button>
              </div>
            ) : (
              <div className="space-y-2">

                {buildingItems.map(
                  (building) => {
                    const isSelected =
                      selectedBuilding?.ids ===
                      building.ids;

                    return (
                      <button
                        key={
                          building.ids
                        }
                        type="button"
                        onClick={() =>
                          handleSelectBuilding(
                            building
                          )
                        }
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

                          <p className="truncate font-semibold">
                            {building.names}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            نقش: مدیر
                          </p>

                        </div>

                        {isSelected && (
                          <Check className="h-5 w-5 shrink-0 text-primary" />
                        )}

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </section>

          {/* ================================================= */}
          {/* جداکننده                                        */}
          {/* ================================================= */}

          <div className="border-t" />

          {/* ================================================= */}
          {/* واحدها                                           */}
          {/* ================================================= */}

          <section className="p-4">

            <div className="mb-3 flex items-center gap-2">
              <Home className="h-5 w-5" />

              <h2 className="text-sm font-bold">
                واحدهای من
              </h2>
            </div>

            {unitItems.length ===
            0 ? (
              <div className="rounded-xl border border-dashed p-5 text-center">
                <Home className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

                <p className="text-sm text-muted-foreground">
                  واحدی برای نمایش وجود ندارد.
                </p>
              </div>
            ) : (
              <div className="space-y-2">

                {unitItems.map(
                  (unit) => {
                    const isSelected =
                      selectedUnit?.idv ===
                      unit.idv;

                    const roleText =
                      getUnitRoleText(
                        unit
                      );

                    return (
                      <button
                        key={`${unit.ids}-${unit.idv}`}
                        type="button"
                        onClick={() =>
                          handleSelectUnit(
                            unit
                          )
                        }
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
                            ساختمان:{" "}
                            {unit.names}
                          </p>

                          <p className="mt-1 truncate font-semibold">
                            واحد:{" "}
                            {unit.namev}
                          </p>

                          <p className="mt-1 text-xs text-muted-foreground">
                            نقش من:{" "}
                            {roleText}
                          </p>

                        </div>

                        {isSelected && (
                          <Check className="h-5 w-5 shrink-0 text-primary" />
                        )}

                      </button>
                    );
                  }
                )}

              </div>
            )}

          </section>

          {/* ================================================= */}
          {/* Footer                                           */}
          {/* ================================================= */}

          <div className="border-t p-4">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={() =>
                onOpenChange(false)
              }
            >
              بستن
            </Button>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}

/*
 * ==========================================================
 * تشخیص نقش کاربر در واحد
 * ==========================================================
 *
 * Flutter هم بر اساس malek / saken نقش را نشان می‌دهد.
 *
 * اگر malek وجود داشته باشد و saken خالی باشد:
 * مالک
 *
 * اگر saken وجود داشته باشد و malek خالی باشد:
 * ساکن
 *
 * اگر هر دو وجود داشته باشند:
 * مالک و ساکن
 *
 * در غیر این صورت:
 * واحد
 * ==========================================================
 */

function getUnitRoleText(
  unit: {
    malek?: string;
    saken?: string;
  }
) {
  if (
    unit.malek &&
    !unit.saken
  ) {
    return "مالک";
  }

  if (
    unit.saken &&
    !unit.malek
  ) {
    return "ساکن";
  }

  if (
    unit.malek &&
    unit.saken
  ) {
    return "مالک و ساکن";
  }

  return "واحد";
}