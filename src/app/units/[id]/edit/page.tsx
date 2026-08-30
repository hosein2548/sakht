// src/app/units/[id]/edit/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";

import Link from "next/link";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import { useParams, useRouter } from "next/navigation";

import {
  ArrowRight,
  Building2,
  Save,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import {
  unitDetailApi,
} from "@/src/features/units/api/unit-detail.api";

import {
  useUnitEditStore,
} from "@/src/features/units/store/unit-edit.store";

export default function EditUnitPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const selectedBuilding =
    useBuildingStore(
      (state) => state.selectedBuilding
    );

  const selectedUnit =
    useBuildingStore(
      (state) => state.selectedUnit
    );

  const router =
    useRouter();

  const unitId =
    params.id;

  const [ids, setIds] =
    useState("");

  const [namevahed, setNamevahed] =
    useState("");

  const [metter, setMetter] =
    useState("");

  const [parking, setParking] =
    useState("");

  const [anbari, setAnbari] =
    useState("");

  const [aab, setAab] =
    useState("");

  const [gaz, setGaz] =
    useState("");

  const [bargh, setBargh] =
    useState("");

  const [tozihat, setTozihat] =
    useState("");

  const [datefrom, setDatefrom] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState<string | null>(null);

  const isSaving =
    useUnitEditStore(
      (state) => state.isSaving
    );

  const saveError =
    useUnitEditStore(
      (state) => state.error
    );

  const saveSuccess =
    useUnitEditStore(
      (state) => state.success
    );

  const setSaving =
    useUnitEditStore(
      (state) => state.setSaving
    );

  const setSaveError =
    useUnitEditStore(
      (state) => state.setError
    );

  const setSaveSuccess =
    useUnitEditStore(
      (state) => state.setSuccess
    );

  const resetSaveState =
    useUnitEditStore(
      (state) => state.reset
    );

  /*
   * دریافت اطلاعات موجود واحد
   */
  useEffect(() => {
    if (!unitId) {
      return;
    }

    const loadUnit =
      async () => {
        try {
          setLoading(true);
          setLoadError(null);

          const result =
            await unitDetailApi.getOne(
              unitId
            );

          if (!result) {
            setLoadError(
              "اطلاعات واحد پیدا نشد."
            );

            return;
          }

          setNamevahed(
            result.namevahed
          );

          setMetter(
            result.metter
          );

          setParking(
            result.parking
          );

          setAnbari(
            result.anbari
          );

          setAab(
            result.aab
          );

          setGaz(
            result.gaz
          );

          setBargh(
            result.bargh
          );

          setTozihat(
            result.tozihat
          );

          setDatefrom(
            result.dateFrom
          );

        } catch (error) {
          console.error(
            "Load unit edit error:",
            error
          );

          setLoadError(
            "دریافت اطلاعات واحد با خطا مواجه شد."
          );
        } finally {
          setLoading(false);
        }
      };

    void loadUnit();
  }, [unitId]);

  const handleSubmit =
    async (
      event: FormEvent<HTMLFormElement>
    ) => {
      event.preventDefault();

      if (!unitId) {
        return;
      }

      if (!namevahed.trim()) {
        setSaveError(
          "نام واحد را وارد کنید."
        );

        return;
      }

      if (!metter.trim()) {
        setSaveError(
          "متراژ واحد را وارد کنید."
        );

        return;
      }

      if (
        datefrom.length !== 10
      ) {
        setSaveError(
          "تاریخ را به صورت صحیح وارد کنید."
        );

        return;
      }

      try {
        setSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        const buildingId =
          selectedBuilding?.ids ??
          selectedUnit?.ids ??
          "";

        if (!buildingId) {
          setSaveError(
            "شناسه ساختمان پیدا نشد."
          );

          return;
        }

        // ✅ استفاده از متد update
        const result =
          await unitDetailApi.update(
            unitId,
            {
              namevahed: namevahed.trim(),
              metter: metter.trim(),
              aab: aab.trim() || "0",
              gaz: gaz.trim() || "0",
              bargh: bargh.trim() || "0",
              parking: parking.trim() || "0",
              anbari: anbari.trim() || "0",
              tozihat: tozihat.trim() || "0",
              dateFrom: datefrom.trim(),
            }
          );

        if (!result.success) {
          setSaveError(
            result.message ??
              "ذخیره انجام نشد."
          );

          return;
        }

        setSaveSuccess(true);

        setTimeout(() => {
          router.replace(
            `/units/${unitId}`
          );
        }, 700);
      } catch (error) {
        console.error(
          "Save unit error:",
          error
        );

        setSaveError(
          "ارتباط با سرور هنگام ذخیره اطلاعات برقرار نشد."
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div
      dir="rtl"
      className="space-y-5 px-4 py-5"
    >
      {/* Header */}

      <div className="flex items-center gap-3">
        <Link
          href={`/units/${unitId}`}
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-xl font-bold">
            ویرایش اطلاعات واحد
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            واحد {unitId}
          </p>
        </div>
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex min-h-60 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      ) : loadError ? (
        <Card>
          <CardContent className="p-6 text-center text-sm text-destructive">
            {loadError}
          </CardContent>
        </Card>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                مشخصات واحد
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">

              <div className="space-y-2">
                <Label>
                  نام واحد
                </Label>

                <Input
                  value={namevahed}
                  maxLength={15}
                  onChange={(event) =>
                    setNamevahed(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  متراژ واحد
                </Label>

                <Input
                  value={metter}
                  inputMode="numeric"
                  maxLength={4}
                  onChange={(event) =>
                    setMetter(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">

                <div className="space-y-2">
                  <Label>
                    شماره پارکینگ
                  </Label>

                  <Input
                    value={parking}
                    onChange={(event) =>
                      setParking(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    شماره انباری
                  </Label>

                  <Input
                    value={anbari}
                    onChange={(event) =>
                      setAnbari(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    آب
                  </Label>

                  <Input
                    value={aab}
                    onChange={(event) =>
                      setAab(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    گاز
                  </Label>

                  <Input
                    value={gaz}
                    onChange={(event) =>
                      setGaz(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    برق
                  </Label>

                  <Input
                    value={bargh}
                    onChange={(event) =>
                      setBargh(
                        event.target.value
                      )
                    }
                    disabled={isSaving}
                  />
                </div>

              </div>

              <div className="space-y-2">
                <Label>
                  تاریخ شروع
                </Label>

                <Input
                  value={datefrom}
                  maxLength={10}
                  placeholder="1404/01/01"
                  dir="ltr"
                  onChange={(event) =>
                    setDatefrom(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  توضیحات
                </Label>

                <Textarea
                  value={tozihat}
                  maxLength={150}
                  onChange={(event) =>
                    setTozihat(
                      event.target.value
                    )
                  }
                  disabled={isSaving}
                />
              </div>

              {saveError && (
                <p className="text-sm text-destructive">
                  {saveError}
                </p>
              )}

              {saveSuccess && (
                <p className="text-sm text-success">
                  اطلاعات با موفقیت ذخیره شد.
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSaving}
              >
                <Save className="ml-2 h-4 w-4" />

                {isSaving
                  ? "در حال ذخیره..."
                  : "ذخیره اطلاعات"}
              </Button>

            </CardContent>
          </Card>
        </form>
      )}
    </div>
  );
}