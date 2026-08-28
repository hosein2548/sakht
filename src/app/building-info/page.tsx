"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Edit,
  Plus,
  Trash2,
  Building2,
  X,
} from "lucide-react";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  buildingInfoApi,
} from "@/src/features/building-info/api/building-info.api";

import {
  useBuildingInfoStore,
} from "@/src/features/building-info/store/building-info.store";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

type DialogType =
  | "add"
  | "rename"
  | "delete"
  | null;

export default function BuildingInfoPage() {
  const selectedBuilding =
    useBuildingStore(
      (state) =>
        state.selectedBuilding
    );

  const items =
    useBuildingInfoStore(
      (state) => state.items
    );

  const isLoading =
    useBuildingInfoStore(
      (state) => state.isLoading
    );

  const error =
    useBuildingInfoStore(
      (state) => state.error
    );

  const setItems =
    useBuildingInfoStore(
      (state) => state.setItems
    );

  const setLoading =
    useBuildingInfoStore(
      (state) => state.setLoading
    );

  const setError =
    useBuildingInfoStore(
      (state) => state.setError
    );

  const [
    dialog,
    setDialog,
  ] = useState<DialogType>(
    null
  );

  const [selectedItemId, setSelectedItemId] =
    useState("");

  const [name, setName] =
    useState("");

  const [description, setDescription] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const buildingId =
    selectedBuilding?.ids ??
    "";

  const loadInfo =
    async () => {
      if (!buildingId) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const result =
          await buildingInfoApi.getAll(
            buildingId
          );

        setItems(result);
      } catch (requestError) {
        console.error(
          "Building info loading error:",
          requestError
        );

        setError(
          "دریافت اطلاعات ساختمان با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadInfo();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId]);

  const closeDialog =
    () => {
      if (saving) {
        return;
      }

      setDialog(null);

      setSelectedItemId("");

      setName("");

      setDescription("");

      setMessage("");
    };

  const openAdd =
    () => {
      setName("");

      setDescription("");

      setMessage("");

      setDialog("add");
    };

  const openRename =
    () => {
      setName(
        selectedBuilding?.names ??
          ""
      );

      setMessage("");

      setDialog("rename");
    };

  const openDelete =
    (id: string) => {
      setSelectedItemId(id);

      setMessage("");

      setDialog("delete");
    };

  const handleAdd =
    async () => {
      if (!buildingId) {
        return;
      }

      if (!name.trim()) {
        setMessage(
          "عنوان را وارد کنید."
        );

        return;
      }

      if (!description.trim()) {
        setMessage(
          "توضیحات را وارد کنید."
        );

        return;
      }

      try {
        setSaving(true);

        setMessage("");

        const result =
          await buildingInfoApi.add(
            buildingId,
            name.trim(),
            description.trim()
          );

        if (!result.success) {
          setMessage(
            result.message ??
              "ثبت اطلاعات انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadInfo();
      } catch (requestError) {
        console.error(
          "Add building info error:",
          requestError
        );

        setMessage(
          "ثبت اطلاعات با خطا مواجه شد."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleRename =
    async () => {
      if (!buildingId) {
        return;
      }

      if (!name.trim()) {
        setMessage(
          "نام ساختمان را وارد کنید."
        );

        return;
      }

      try {
        setSaving(true);

        setMessage("");

        const result =
          await buildingInfoApi.rename(
            buildingId,
            name.trim()
          );

        if (!result.success) {
          setMessage(
            result.message ??
              "تغییر نام انجام نشد."
          );

          return;
        }

        /*
         * لیست ساختمان را در Store هم
         * به‌روزرسانی می‌کنیم تا Header/Drawer
         * همان لحظه نام جدید را نشان دهد.
         */
        const current =
          useBuildingStore.getState();

        const updated =
          current.buildings.map(
            (building) =>
              building.ids ===
              buildingId
                ? {
                    ...building,
                    names:
                      name.trim(),
                  }
                : building
          );

        current.setBuildings(
          updated
        );

        closeDialog();
      } catch (requestError) {
        console.error(
          "Rename building error:",
          requestError
        );

        setMessage(
          "تغییر نام ساختمان با خطا مواجه شد."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleDelete =
    async () => {
      if (!selectedItemId) {
        return;
      }

      try {
        setSaving(true);

        setMessage("");

        const result =
          await buildingInfoApi.remove(
            selectedItemId
          );

        if (!result.success) {
          setMessage(
            result.message ??
              "حذف انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadInfo();
      } catch (requestError) {
        console.error(
          "Delete building info error:",
          requestError
        );

        setMessage(
          "حذف اطلاعات با خطا مواجه شد."
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

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">
            اطلاعات ساختمان
          </h1>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {selectedBuilding?.names ??
              "ساختمان"}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={
            openRename
          }
          disabled={!buildingId}
          aria-label="ویرایش نام ساختمان"
        >
          <Edit className="h-4 w-4" />
        </Button>
      </div>

      {!buildingId && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            ابتدا یک ساختمان را انتخاب کنید.
          </CardContent>
        </Card>
      )}

      {buildingId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">

              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                توضیحات ساختمان
              </CardTitle>

              <Button
                type="button"
                size="sm"
                onClick={
                  openAdd
                }
              >
                <Plus className="ml-2 h-4 w-4" />
                افزودن
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
            ) : items.length ===
              0 ? (
              <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                اطلاعاتی برای این ساختمان ثبت نشده است.
              </div>
            ) : (
              <div className="space-y-3">
                {items.map(
                  (item) => (
                    <div
                      key={
                        item.id
                      }
                      className="rounded-xl border p-4"
                    >
                      <div className="flex items-start gap-3">

                        <div className="min-w-0 flex-1">

                          <p className="font-semibold">
                            {item.name}
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                            {
                              item.description
                            }
                          </p>

                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            openDelete(
                              item.id
                            )
                          }
                          aria-label="حذف"
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

      {/* Dialog */}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl">

            {dialog ===
              "add" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    ثبت اطلاعات جدید
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
                      عنوان
                    </Label>

                    <Input
                      maxLength={30}
                      value={name}
                      onChange={(
                        event
                      ) =>
                        setName(
                          event.target.value
                        )
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      توضیحات
                    </Label>

                    <Textarea
                      maxLength={30}
                      value={
                        description
                      }
                      onChange={(
                        event
                      ) =>
                        setDescription(
                          event.target.value
                        )
                      }
                      disabled={saving}
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
                      disabled={saving}
                      onClick={
                        handleAdd
                      }
                    >
                      {saving
                        ? "در حال ثبت..."
                        : "ذخیره"}
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
                </div>
              </>
            )}

            {dialog ===
              "rename" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    ویرایش نام
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
                      نام ساختمان
                    </Label>

                    <Input
                      maxLength={30}
                      value={name}
                      onChange={(
                        event
                      ) =>
                        setName(
                          event.target.value
                        )
                      }
                      disabled={saving}
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
                      disabled={saving}
                      onClick={
                        handleRename
                      }
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

            {dialog ===
              "delete" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    حذف اطلاعات
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

                <p className="mt-4 text-sm text-muted-foreground">
                  آیا از حذف این اطلاعات اطمینان دارید؟
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
                      ? "در حال حذف..."
                      : "حذف"}
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