"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
  ArrowRight,
  Edit,
  Plus,
  Trash2,
  User,
  Users,
} from "lucide-react";

import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  unitPeopleApi,
} from "@/src/features/units/api/unit-people.api";

import {
  useUnitDetailStore,
} from "@/src/features/units/store/unit-detail.store";

import type {
  UnitPerson,
} from "@/src/features/units/types/unit-detail.types";
import { string } from "zod";

type PersonRole =
  | "malek"
  | "saken";

interface DialogState {
  mode:
    | "add"
    | "edit"
    | "delete"
    | null;

  role: PersonRole | null;

  person:
    UnitPerson | null;
}

export default function UnitPeoplePage() {
  const params =
    useParams<{
      id: string;
    }>();
  
  const unitId =
    params.id;

   const stateacive="1";

  const user =
    useAppStore(
      (state) => state.user
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

  const people =
    useUnitDetailStore(
      (state) => state.people
    );

  const setPeople = useUnitDetailStore((state) => state.setPeople);

  const isLoadingPeople =
    useUnitDetailStore(
      (state) =>
        state.isLoadingPeople
    );

  const peopleError =
    useUnitDetailStore(
      (state) =>
        state.peopleError
    );

  const setLoadingPeople =
    useUnitDetailStore(
      (state) =>
        state.setLoadingPeople
    );

  const setPeopleError =
    useUnitDetailStore(
      (state) =>
        state.setPeopleError
    );

  /*
   * ----------------------------------------------------
   * فرم
   * ----------------------------------------------------
   */

  const [phone, setPhone] =
    useState("");

  const [date, setDate] =
    useState("");

  const [count, setCount] =
    useState("");

  const [
    dialog,
    setDialog,
  ] = useState<DialogState>({
    mode: null,
    role: null,
    person: null,
  });

  const [saving, setSaving] =
    useState(false);

  const [
    actionMessage,
    setActionMessage,
  ] = useState("");

  /*
   * ----------------------------------------------------
   * مجوز مدیریت
   *
   * در Flutter فقط وقتی modir == yes
   * عملیات مدیریتی نمایش داده می‌شود.
   * ----------------------------------------------------
   */

  const isManager =
    Boolean(
      user?.iduser &&
        (
          selectedBuilding?.idmodir ===
            user.iduser ||
          selectedUnit?.idmodir ===
            user.iduser
        )
    );

  /*
   * ----------------------------------------------------
   * دریافت مجدد مالک/ساکن
   * ----------------------------------------------------
   */

  const loadPeople = async () => {
  if (!unitId) return;

  try {
    setLoadingPeople(true);
    setPeopleError(null);
    

    const result = await unitPeopleApi.getAll(unitId,stateacive);
    
    // ✅ تبدیل Resident[] به UnitPerson[]
    const converted: UnitPerson[] = result.map((item) => ({
      idvahed: unitId,
      iduser: item.iduser,
      idnaghsh: item.idnaghsh,
      nameuser: item.nameuser,
      phone: item.phone,
      datestart: item.datestart,
      count: item.count,
      naghsh: item.naghsh,
    }));
    
    setPeople(converted);
  } catch (error) {
    console.error("People loading error:", error);
    setPeopleError("دریافت اطلاعات مالک و ساکن با خطا مواجه شد.");
  } finally {
    setLoadingPeople(false);
  }
};

  useEffect(() => {
    void loadPeople();
    // عمداً فقط با تغییر unitId دوباره دریافت می‌کنیم.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitId]);

  /*
   * ----------------------------------------------------
   * باز کردن Dialog افزودن
   * ----------------------------------------------------
   */

  const openAddDialog = (
    role: PersonRole
  ) => {
    setActionMessage("");

    setPhone("");

    setDate("");

    setCount("");

    setDialog({
      mode: "add",
      role,
      person: null,
    });
  };

  /*
   * ----------------------------------------------------
   * باز کردن Dialog ویرایش
   * ----------------------------------------------------
   */

  const openEditDialog = (
    person: UnitPerson
  ) => {
    setActionMessage("");

    setPhone(
      person.phone
    );

    setDate(
      person.datestart
    );

    setCount(
      person.count || "0"
    );

    setDialog({
      mode: "edit",
      role:
        person.naghsh === "ساکن"
          ? "saken"
          : "malek",
      person,
    });
  };

  /*
   * ----------------------------------------------------
   * باز کردن Dialog حذف
   * ----------------------------------------------------
   */

  const openDeleteDialog = (
    person: UnitPerson
  ) => {
    setActionMessage("");

    setDialog({
      mode: "delete",
      role:
        person.naghsh === "ساکن"
          ? "saken"
          : "malek",
      person,
    });
  };

  /*
   * ----------------------------------------------------
   * بستن Dialog
   * ----------------------------------------------------
   */

  const closeDialog = () => {
    if (saving) {
      return;
    }

    setDialog({
      mode: null,
      role: null,
      person: null,
    });

    setActionMessage("");
  };

  /*
   * ----------------------------------------------------
   * افزودن مالک/ساکن
   * ----------------------------------------------------
   */

  const handleAdd =
    async () => {
      if (
        !dialog.role ||
        !unitId
      ) {
        return;
      }

      if (
        !/^09\d{9}$/.test(
          phone.trim()
        )
      ) {
        setActionMessage(
          "شماره همراه باید ۱۱ رقم و با 09 شروع شود."
        );

        return;
      }

      if (
        !/^\d{4}\/\d{2}\/\d{2}$/.test(
          date.trim()
        )
      ) {
        setActionMessage(
          "تاریخ شروع را به صورت 1404/01/01 وارد کنید."
        );

        return;
      }

      if (
        dialog.role ===
          "saken" &&
        count &&
        !/^\d+$/.test(
          count
        )
      ) {
        setActionMessage(
          "تعداد نفرات نامعتبر است."
        );

        return;
      }

      try {
        setSaving(true);

        setActionMessage("");

        const result =
          await unitPeopleApi.add(
            unitId,
            phone.trim(),
            date.trim(),
            dialog.role,
            dialog.role ===
              "saken"
              ? count || "0"
              : "0"
          );

        if (!result.success) {
          setActionMessage(
            result.message ??
              "ثبت اطلاعات انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadPeople();
      } catch (error) {
        console.error(
          "Add person error:",
          error
        );

        setActionMessage(
          "ذخیره اطلاعات با خطا مواجه شد."
        );
      } finally {
        setSaving(false);
      }
    };

  /*
   * ----------------------------------------------------
   * ویرایش مالک/ساکن
   * ----------------------------------------------------
   */

  const handleEdit =
    async () => {
      if (
        !dialog.person ||
        !dialog.role ||
        !unitId
      ) {
        return;
      }

      if (
        !/^\d{4}\/\d{2}\/\d{2}$/.test(
          date.trim()
        )
      ) {
        setActionMessage(
          "تاریخ شروع را به صورت 1404/01/01 وارد کنید."
        );

        return;
      }

      if (
        dialog.role === "malek" &&
        !/^09\d{9}$/.test(
          phone.trim()
        )
      ) {
        setActionMessage(
          "شماره همراه مالک نامعتبر است."
        );

        return;
      }

      if (
        dialog.role === "saken" &&
        phone &&
        !/^09\d{9}$/.test(
          phone.trim()
        )
      ) {
        setActionMessage(
          "شماره همراه ساکن نامعتبر است."
        );

        return;
      }

      try {
        setSaving(true);

        setActionMessage("");

        const person =
          dialog.person;

        /*
         * چون API Flutter برای هر تغییر
         * statephp متفاوت دارد، آن را
         * مطابق نوع تغییر انتخاب می‌کنیم.
         */

        let state =
          "editmalek";

        if (
          dialog.role ===
          "saken"
        ) {
          if (
            phone !==
            person.phone
          ) {
            state =
              "edit_saken_phone";
          } else if (
            count !==
            person.count
          ) {
            state =
              "edit_saken_count";
          } else if (
            date !==
            person.datestart
          ) {
            state =
              "edit_saken_date";
          }
        } else {
          if (
            phone !==
            person.phone
          ) {
            state =
              "editmalek";
          } else if (
            date !==
            person.datestart
          ) {
            state =
              "editmalek_date";
          }
        }

        const result =
          await unitPeopleApi.edit(
            unitId,
            person,
            {
              phone:
                dialog.role ===
                "malek"
                  ? phone.trim()
                  : phone.trim(),

              date:
                date.trim(),

              count:
                count || "0",

              state,
            }
          );

        if (!result.success) {
          setActionMessage(
            result.message ??
              "ویرایش انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadPeople();
      } catch (error) {
        console.error(
          "Edit person error:",
          error
        );

        setActionMessage(
          "ویرایش اطلاعات با خطا مواجه شد."
        );
      } finally {
        setSaving(false);
      }
    };

  /*
   * ----------------------------------------------------
   * حذف مالک/ساکن
   * ----------------------------------------------------
   */

  const handleDelete =
    async () => {
      if (
        !dialog.person
      ) {
        return;
      }

      try {
        setSaving(true);

        setActionMessage("");

        const result =
          await unitPeopleApi.remove(
            dialog.person
          );

        if (!result.success) {
          setActionMessage(
            result.message ??
              "حذف انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadPeople();
      } catch (error) {
        console.error(
          "Delete person error:",
          error
        );

        setActionMessage(
          "حذف اطلاعات با خطا مواجه شد."
        );
      } finally {
        setSaving(false);
      }
    };

  const owners =
    people.filter(
      (item) =>
        item.naghsh ===
        "مالک"
    );

  const residents =
    people.filter(
      (item) =>
        item.naghsh ===
        "ساکن"
    );

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
            مالک و ساکن
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            واحد {unitId}
          </p>
        </div>
      </div>

      {/* مجوز مدیریت */}

      {!isManager && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            این بخش فقط برای مدیر ساختمان قابل استفاده است.
          </CardContent>
        </Card>
      )}

      {isManager && (
        <>
          {/* مالک */}

          <PersonSection
            title="مالکین"
            icon={
              <User className="h-5 w-5" />
            }
            people={owners}
            role="malek"
            onAdd={
              openAddDialog
            }
            onEdit={
              openEditDialog
            }
            onDelete={
              openDeleteDialog
            }
          />

          {/* ساکنین */}

          <PersonSection
            title="ساکنین"
            icon={
              <Users className="h-5 w-5" />
            }
            people={residents}
            role="saken"
            onAdd={
              openAddDialog
            }
            onEdit={
              openEditDialog
            }
            onDelete={
              openDeleteDialog
            }
          />

          {isLoadingPeople && (
            <div className="flex justify-center py-4">
              <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          )}

          {peopleError && (
            <p className="text-center text-sm text-destructive">
              {peopleError}
            </p>
          )}
        </>
      )}

      {/* Dialog */}

      {dialog.mode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl">

            {dialog.mode ===
              "add" && (
              <>
                <h2 className="text-lg font-bold">
                  {dialog.role ===
                  "malek"
                    ? "اضافه کردن مالک جدید"
                    : "اضافه کردن ساکن جدید"}
                </h2>

                <div className="mt-5 space-y-4">

                  <div className="space-y-2">
                    <Label>
                      شماره همراه
                    </Label>

                    <Input
                      dir="ltr"
                      inputMode="numeric"
                      maxLength={11}
                      value={phone}
                      onChange={(event) =>
                        setPhone(
                          event.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      disabled={
                        saving
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      تاریخ شروع
                    </Label>

                    <Input
                      dir="ltr"
                      maxLength={10}
                      placeholder="1404/01/01"
                      value={date}
                      onChange={(event) =>
                        setDate(
                          event.target.value
                        )
                      }
                      disabled={
                        saving
                      }
                    />
                  </div>

                  {dialog.role ===
                    "saken" && (
                    <div className="space-y-2">
                      <Label>
                        تعداد نفرات
                      </Label>

                      <Input
                        inputMode="numeric"
                        maxLength={2}
                        value={count}
                        onChange={(
                          event
                        ) =>
                          setCount(
                            event.target.value.replace(
                              /\D/g,
                              ""
                            )
                          )
                        }
                        disabled={
                          saving
                        }
                      />
                    </div>
                  )}

                  {actionMessage && (
                    <p className="text-sm text-destructive">
                      {
                        actionMessage
                      }
                    </p>
                  )}

                </div>

                <DialogActions
                  saving={saving}
                  onCancel={
                    closeDialog
                  }
                  onSave={
                    handleAdd
                  }
                />
              </>
            )}

            {dialog.mode ===
              "edit" &&
              dialog.person && (
                <>
                  <h2 className="text-lg font-bold">
                    ویرایش{" "}
                    {dialog.role ===
                    "malek"
                      ? "مالک"
                      : "ساکن"}
                  </h2>

                  <div className="mt-5 space-y-4">

                    <div className="space-y-2">
                      <Label>
                        شماره همراه
                      </Label>

                      <Input
                        dir="ltr"
                        inputMode="numeric"
                        maxLength={11}
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
                          saving
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>
                        تاریخ شروع
                      </Label>

                      <Input
                        dir="ltr"
                        maxLength={10}
                        value={date}
                        onChange={(
                          event
                        ) =>
                          setDate(
                            event.target.value
                          )
                        }
                        disabled={
                          saving
                        }
                      />
                    </div>

                    {dialog.role ===
                      "saken" && (
                      <div className="space-y-2">
                        <Label>
                          تعداد نفرات
                        </Label>

                        <Input
                          inputMode="numeric"
                          maxLength={2}
                          value={count}
                          onChange={(
                            event
                          ) =>
                            setCount(
                              event.target.value.replace(
                                /\D/g,
                                ""
                              )
                            )
                          }
                          disabled={
                            saving
                          }
                        />
                      </div>
                    )}

                    {actionMessage && (
                      <p className="text-sm text-destructive">
                        {
                          actionMessage
                        }
                      </p>
                    )}

                  </div>

                  <DialogActions
                    saving={saving}
                    onCancel={
                      closeDialog
                    }
                    onSave={
                      handleEdit
                    }
                  />
                </>
              )}

            {dialog.mode ===
              "delete" &&
              dialog.person && (
                <>
                  <h2 className="text-lg font-bold">
                    حذف{" "}
                    {dialog.role ===
                    "malek"
                      ? "مالک"
                      : "ساکن"}
                  </h2>

                  <p className="mt-4 text-sm text-muted-foreground">
                    آیا از حذف{" "}
                    {dialog.person.nameuser ||
                      "این شخص"}{" "}
                    اطمینان دارید؟
                  </p>

                  {actionMessage && (
                    <p className="mt-4 text-sm text-destructive">
                      {
                        actionMessage
                      }
                    </p>
                  )}

                  <div className="mt-6 flex gap-3">

                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1"
                      disabled={
                        saving
                      }
                      onClick={
                        handleDelete
                      }
                    >
                      <Trash2 className="ml-2 h-4 w-4" />

                      {saving
                        ? "در حال حذف..."
                        : "حذف"}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      disabled={
                        saving
                      }
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

/*
 * ========================================================
 * PersonSection
 * ========================================================
 */

function PersonSection({
  title,
  icon,
  people,
  role,
  onAdd,
  onEdit,
  onDelete,
}: {
  title: string;

  icon: React.ReactNode;

  people: UnitPerson[];

  role: PersonRole;

  onAdd: (
    role: PersonRole
  ) => void;

  onEdit: (
    person: UnitPerson
  ) => void;

  onDelete: (
    person: UnitPerson
  ) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3">

          <CardTitle className="flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>

          <Button
            type="button"
            size="sm"
            onClick={() =>
              onAdd(role)
            }
          >
            <Plus className="ml-2 h-4 w-4" />
            افزودن
          </Button>

        </div>
      </CardHeader>

      <CardContent>
        {people.length === 0 ? (
          <div className="rounded-xl border border-dashed p-5 text-center text-sm text-muted-foreground">
            موردی ثبت نشده است.
          </div>
        ) : (
          <div className="space-y-3">
            {people.map(
              (person) => (
                <div
                  key={`${person.iduser}-${person.idnaghsh}`}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <User className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="font-semibold">
                        {person.nameuser ||
                          "نام ثبت نشده"}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {person.phone ||
                          "شماره ثبت نشده"}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        شروع:{" "}
                        {person.datestart ||
                          "—"}
                      </p>

                      {role ===
                        "saken" && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          تعداد نفرات:{" "}
                          {person.count ||
                            "0"}
                        </p>
                      )}

                    </div>

                    <div className="flex shrink-0 gap-1">

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onEdit(
                            person
                          )
                        }
                        aria-label="ویرایش"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          onDelete(
                            person
                          )
                        }
                        aria-label="حذف"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>

                    </div>

                  </div>
                </div>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/*
 * ========================================================
 * DialogActions
 * ========================================================
 */

function DialogActions({
  saving,
  onCancel,
  onSave,
}: {
  saving: boolean;

  onCancel: () => void;

  onSave: () => void;
}) {
  return (
    <div className="mt-6 flex gap-3">

      <Button
        type="button"
        className="flex-1"
        disabled={saving}
        onClick={onSave}
      >
        {saving
          ? "در حال ذخیره..."
          : "ذخیره"}
      </Button>

      <Button
        type="button"
        variant="outline"
        className="flex-1"
        disabled={saving}
        onClick={onCancel}
      >
        انصراف
      </Button>

    </div>
  );
}