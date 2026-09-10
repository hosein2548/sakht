"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  Plus,
  Trash2,
  UserCog,
  X,
} from "lucide-react";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  managerApi,
} from "@/src/features/management/api/manager.api";

import {
  useManagerStore,
} from "@/src/features/management/store/manager.store";

import type {
  Manager,
} from "@/src/features/management/types/manager.types";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

interface DialogState {
  type:
    | "add"
    | "delete"
    | null;

  manager:
    | Manager
    | null;
}

export default function ManagementPage() {
  const user =
    useAppStore(
      (state) => state.user
    );

  const selectedBuilding =
    useBuildingStore(
      (state) =>
        state.selectedBuilding
    );

  const managers =
    useManagerStore(
      (state) => state.managers
    );

  const isLoading =
    useManagerStore(
      (state) => state.isLoading
    );

  const error =
    useManagerStore(
      (state) => state.error
    );

  const setManagers =
    useManagerStore(
      (state) => state.setManagers
    );

  const setLoading =
    useManagerStore(
      (state) => state.setLoading
    );

  const setError =
    useManagerStore(
      (state) => state.setError
    );

  const [dialog, setDialog] =
    useState<DialogState>({
      type: null,
      manager: null,
    });

  const [confirmUnknownUser, setConfirmUnknownUser] =
  useState(false);

  const [pendingPhone, setPendingPhone] =
  useState("");

  const [phone, setPhone] =
    useState("");

  const [
    checkingPhone,
    setCheckingPhone,
  ] = useState(false);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const buildingId =
    selectedBuilding?.ids ??
    "";

  const isManager =
    Boolean(
      user?.iduser &&
        selectedBuilding?.idmodir ===
          user.iduser
    );

  /*
   * دریافت مدیران
   */
  const loadManagers =
    async () => {
      if (!buildingId) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const result =
          await managerApi.getAll(
            buildingId
          );

        setManagers(result);
      } catch (requestError) {
        console.error(
          "Managers loading error:",
          requestError
        );

        setError(
          "دریافت لیست مدیران با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadManagers();

    // این تابع فقط هنگام تغییر ساختمان اجرا می‌شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId]);

  /*
   * باز کردن افزودن مدیر
   */
  const openAdd =
    () => {
      setPhone("");

      setMessage("");

      setDialog({
        type: "add",
        manager: null,
      });
    };

  /*
   * بستن
   */
  const closeDialog =
    () => {
      if (saving) {
        return;
      }

      setDialog({
        type: null,
        manager: null,
      });

      setPhone("");

      setMessage("");
    };

  /*
   * افزودن مدیر
   *
   * Flutter:
   * checknumber
   * سپس
   * savenewmodir
   */
  const handleAdd =
    async () => {
      if (
        !user?.iduser ||
        !buildingId
      ) {
        return;
      }

      if (
        !/^09\d{9}$/.test(
          phone.trim()
        )
      ) {
        setMessage(
          "شماره موبایل باید ۱۱ رقم و با 09 شروع شود."
        );

        return;
      }

      try {
        setCheckingPhone(
          true
        );

        setMessage("");

        const check =
          await managerApi.checkPhone(
            buildingId,
            user.iduser,
            phone.trim()
          );

        if (
          check ===
          "notekrari"
        ) {
          setMessage(
            "این شماره در حال حاضر مدیر این ساختمان می‌باشد."
          );

          return;
        }

       if (
  check === "nouser"
) {

  setPendingPhone(
    phone.trim()
  );


  setConfirmUnknownUser(true);


  setMessage(
    "این شماره تا الان ثبت‌نام نکرده است. آیا از ثبت این شماره مطمئن هستید؟"
  );


  return;
}

        setCheckingPhone(
          false
        );

        setSaving(true);

        const result =
          await managerApi.addManager(
            buildingId,
            user.iduser,
            phone.trim()
          );

        if (!result.success) {
          setMessage(
            result.message ??
              "ثبت مدیر انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadManagers();
      } catch (requestError) {
        console.error(
          "Add manager error:",
          requestError
        );

        setMessage(
          "ثبت مدیر با خطا مواجه شد."
        );
      } finally {
        setCheckingPhone(
          false
        );

        setSaving(false);
      }
    };

    const handleConfirmUnknownUser =
  async () => {

    if (
      !user?.iduser ||
      !buildingId ||
      !pendingPhone
    ) {
      return;
    }


    try {

      setSaving(true);


      const result =
        await managerApi.addManager(
          buildingId,
          user.iduser,
          pendingPhone
        );


      if (!result.success) {

        setMessage(
          result.message ??
          "ثبت مدیر انجام نشد."
        );

        return;
      }


      setConfirmUnknownUser(false);

      setPendingPhone("");

      closeDialog();


      await loadManagers();


    } catch(error){

      console.error(
        "Confirm manager error:",
        error
      );


      setMessage(
        "ثبت مدیر با خطا مواجه شد."
      );


    } finally {

      setSaving(false);

    }

};
  /*
   * حذف مدیر
   */
  const handleDelete =
    async () => {
      if (
        !user?.iduser ||
        !buildingId ||
        !dialog.manager
      ) {
        return;
      }

      try {
        setSaving(true);

        setMessage("");

        const result =
          await managerApi.deleteManager(
            buildingId,
            user.iduser,
            dialog.manager
          );

        if (!result.success) {
          setMessage(
            result.message ??
              "حذف مدیر انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadManagers();
      } catch (requestError) {
        console.error(
          "Delete manager error:",
          requestError
        );

        setMessage(
          "حذف مدیر با خطا مواجه شد."
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
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-xl font-bold">
            قسمت مدیریت
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {selectedBuilding?.names ??
              "ساختمان"}
          </p>
        </div>
      </div>

      {/* عدم انتخاب ساختمان */}

      {!buildingId && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            ابتدا یک ساختمان را انتخاب کنید.
          </CardContent>
        </Card>
      )}

      {/* عدم دسترسی */}

      {buildingId &&
        !isManager && (
          <Card>
            <CardContent className="p-6 text-center text-sm text-muted-foreground">
              این بخش فقط برای مدیر ساختمان قابل استفاده است.
            </CardContent>
          </Card>
        )}

      {/* صفحه مدیریت */}

      {buildingId &&
        isManager && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">

                <CardTitle className="flex items-center gap-2">
                  <UserCog className="h-5 w-5" />
                  لیست مدیران
                </CardTitle>

                <Button
                  type="button"
                  size="sm"
                  onClick={
                    openAdd
                  }
                >
                  <Plus className="ml-2 h-4 w-4" />
                  افزودن مدیر
                </Button>

              </div>
            </CardHeader>

            <CardContent>

              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {isLoading ? (
                <div className="flex min-h-40 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : managers.length ===
                0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  مدیری برای این ساختمان ثبت نشده است.
                </div>
              ) : (
                <div className="space-y-3">

                  {managers.map(
                    (manager) => (
                      <div
                        key={`${manager.mobile}-${manager.statemodir}-${manager.datestart}`}
                        className="rounded-xl border p-4"
                      >
                        <div className="flex items-start gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <UserCog className="h-5 w-5" />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="font-semibold">
                              {manager.name ||
                                "نام ثبت نشده"}
                            </p>

                            <p className="mt-1 text-sm text-muted-foreground">
                              {manager.mobile}
                            </p>

                            <div className="mt-2 flex flex-wrap gap-2">

                              <span className="rounded-full bg-muted px-2 py-1 text-xs">
                                {
                                  manager.statemodir
                                }
                              </span>

                              {manager.datestart && (
                                <span className="text-xs text-muted-foreground">
                                  شروع:{" "}
                                  {
                                    manager.datestart
                                  }
                                </span>
                              )}

                              {manager.dateend && (
                                <span className="text-xs text-muted-foreground">
                                  پایان:{" "}
                                  {
                                    manager.dateend
                                  }
                                </span>
                              )}

                            </div>

                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setDialog({
                                type: "delete",
                                manager,
                              })
                            }
                            aria-label="پایان مدیریت"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>

                        </div>
                      </div>
                    )
                  )}

                </div>
              )}

            </CardContent>
          </Card>
        )}

      {/* Dialog افزودن / حذف */}

      {dialog.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl">

            {dialog.type ===
              "add" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    افزودن مدیر
                  </h2>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={
                      closeDialog
                    }
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-5 space-y-4">

                  <div className="space-y-2">
                    <Label>
                      شماره موبایل مدیر
                    </Label>

                    <Input
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="09123456789"
                      value={phone}
                      onChange={(
                        event
                      ) =>
                        setPhone(
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      disabled={
                        checkingPhone ||
                        saving
                      }
                    />
                  </div>

                  {message && (
                    <p className="text-sm text-destructive">
                      {message}
                    </p>
                  )}

                  <div className="flex gap-3">

                    <Button
                      type="button"
                      className="flex-1"
                      disabled={
                        checkingPhone ||
                        saving
                      }
                      onClick={
                        handleAdd
                      }
                    >
                      {checkingPhone
                        ? "در حال بررسی..."
                        : saving
                          ? "در حال ثبت..."
                          : "ذخیره"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={
                        checkingPhone ||
                        saving
                      }
                      onClick={
                        closeDialog
                      }
                    >
                      انصراف
                    </Button>

                  </div>

                </div>
              </>
            )}

            {dialog.type ===
              "delete" &&
              dialog.manager && (
              <>
                <h2 className="text-lg font-bold">
                  پایان مدیریت
                </h2>

                <p className="mt-4 text-sm text-muted-foreground">
                  آیا می‌خواهید مدیریت{" "}
                  <strong>
                    {dialog.manager.name ||
                      dialog.manager.mobile}
                  </strong>{" "}
                  به پایان برسد؟
                </p>

                <p className="mt-2 text-xs text-muted-foreground">
                  نقش:{" "}
                  {
                    dialog.manager
                      .statemodir
                  }
                </p>

                {message && (
                  <p className="mt-4 text-sm text-destructive">
                    {message}
                  </p>
                )}

                <div className="mt-6 flex gap-3">

                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    disabled={saving}
                    onClick={
                      handleDelete
                    }
                  >
                    {saving
                      ? "در حال انجام..."
                      : "پایان مدیریت"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    disabled={saving}
                    onClick={
                      closeDialog
                    }
                  >
                    انصراف
                  </Button>

                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );

  
}