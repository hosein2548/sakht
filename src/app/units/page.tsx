// src/app/units/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import {
  ArrowRight,
  AlertTriangle,
  Building2,
  Home,
  RefreshCw,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useAppStore } from "@/src/core/store/app.store";
import { useBuildingStore } from "@/src/features/building/store/building.store";

import {
  unitApi,
} from "@/src/features/units/api/unit.api";

import {
  useUnitStore,
} from "@/src/features/units/store/unit.store";

export default function UnitsPage() {
  // ✅ دریافت user از AppStore
  const user = useAppStore((state) => state.user);
  
  const selectedBuilding = useBuildingStore(
    (state) => state.selectedBuilding
  );

  const selectedUnit = useBuildingStore(
    (state) => state.selectedUnit
  );

  const units = useUnitStore(
    (state) => state.units
  );

  const isLoading = useUnitStore(
    (state) => state.isLoading
  );

  const error = useUnitStore(
    (state) => state.error
  );

  const setUnits = useUnitStore(
    (state) => state.setUnits
  );

  const setLoading = useUnitStore(
    (state) => state.setLoading
  );

  const setError = useUnitStore(
    (state) => state.setError
  );

  useEffect(() => {
    const buildingId =
      selectedBuilding?.ids ??
      selectedUnit?.ids ??
      "";

    if (!buildingId) {
      return;
    }

    const loadUnits =
      async () => {
        try {
          setLoading(true);
          setError(null);

          const result =
            await unitApi.getAll(
              buildingId
            );

          setUnits(result);
        } catch (requestError) {
          console.error(
            "Units loading error:",
            requestError
          );

          setError(
            "دریافت اطلاعات واحدها با خطا مواجه شد."
          );
        } finally {
          setLoading(false);
        }
      };

    void loadUnits();
  }, [
    selectedBuilding?.ids,
    selectedUnit?.ids,
    setUnits,
    setLoading,
    setError,
  ]);

  const buildingName =
    selectedBuilding?.names ??
    selectedUnit?.names ??
    "ساختمان";

  // ✅ آیا کاربر مدیر ساختمان است؟
  const isManager = Boolean(
    user?.iduser && selectedBuilding?.idmodir === user.iduser
  );

  return (
    <div
      dir="rtl"
      className="space-y-5 px-4 py-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6" />
<Link href="/dashboard" className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted">
          <ArrowRight className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">
            اطلاعات واحدها
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {buildingName}
          </p>
        </div>

        {/* ✅ دکمه ایجاد واحد جدید - فقط برای مدیر */}
        {isManager && (
          <Link
            href="/units/new"
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="ایجاد واحد جدید"
          >
            <Plus className="h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Error */}
      {error && (
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <AlertTriangle className="h-5 w-5 text-destructive" />

            <span className="flex-1 text-sm">
              {error}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                window.location.reload();
              }}
            >
              <RefreshCw className="ml-2 h-4 w-4" />
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center p-5">
            <div className="text-center">
              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                در حال دریافت اطلاعات واحدها...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty */}
      {!isLoading &&
        !error &&
        units.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Home className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
              <p className="font-semibold">
                واحدی برای این ساختمان پیدا نشد.
              </p>
            </CardContent>
          </Card>
        )}

      {/* Unit list */}
      {!isLoading &&
        units.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <Card
                key={`${unit.ids}-${unit.idv}`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Home className="h-5 w-5" />
                    </div>
                    <span>
                      واحد {unit.namev}
                    </span>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      ساختمان
                    </span>
                    <span className="font-medium">
                      {unit.names}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">
                      متراژ
                    </span>
                    <span className="font-medium">
                      {unit.metter || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-3 text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      نفرات
                    </span>
                    <span className="font-medium">
                      {unit.countnafar || "—"}
                    </span>
                  </div>

                  <div className="border-t pt-3 text-xs text-muted-foreground">
                    مدیر ساختمان:{" "}
                    {unit.namemodir || "—"}
                  </div>

                  <Link
                    href={`/units/${unit.idv}`}
                    className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    مشاهده مشخصات واحد
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}