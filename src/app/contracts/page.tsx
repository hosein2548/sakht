"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  FileText,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  contractApi,
} from "@/src/features/contracts/api/contract.api";

import {
  useContractStore,
} from "@/src/features/contracts/store/contract.store";

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

export default function ContractsPage() {
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

  const contracts =
    useContractStore(
      (state) =>
        state.contracts
    );

  const isLoading =
    useContractStore(
      (state) =>
        state.isLoading
    );

  const error =
    useContractStore(
      (state) =>
        state.error
    );

  const setContracts =
    useContractStore(
      (state) =>
        state.setContracts
    );

  const setLoading =
    useContractStore(
      (state) =>
        state.setLoading
    );

  const setError =
    useContractStore(
      (state) =>
        state.setError
    );

  const [
    active,
    setActive,
  ] = useState(true);

  const [
    dialog,
    setDialog,
  ] = useState<
    | "add"
    | "delete"
    | "terminate"
    | null
  >(null);

  const [
    selectedContractId,
    setSelectedContractId,
  ] = useState("");

  const [
    terminateReason,
    setTerminateReason,
  ] = useState("");

  const [
    terminateDate,
    setTerminateDate,
  ] = useState("");

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    actionError,
    setActionError,
  ] = useState("");

  const buildingId =
    selectedBuilding?.ids ??
    selectedUnit?.ids ??
    "";

  const isManager =
    Boolean(
      user?.iduser &&
        selectedBuilding?.idmodir ===
          user.iduser
    );

  const loadContracts =
    async () => {
      if (!buildingId) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const result =
          await contractApi.getAll(
            buildingId,
            active
          );

        setContracts(
          result
        );
      } catch (requestError) {
        console.error(
          "Contracts loading error:",
          requestError
        );

        setError(
          "دریافت قراردادها با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadContracts();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    buildingId,
    active,
  ]);

  const closeDialog =
    () => {
      if (saving) {
        return;
      }

      setDialog(null);

      setSelectedContractId("");

      setTerminateReason("");

      setTerminateDate("");

      setActionError("");
    };

  const handleDelete =
    async () => {
      if (
        !buildingId ||
        !user?.iduser ||
        !selectedContractId
      ) {
        return;
      }

      try {
        setSaving(true);

        setActionError("");

        const result =
          await contractApi.remove(
            buildingId,
            user.iduser,
            selectedContractId
          );

        if (!result.success) {
          setActionError(
            result.message ??
              "حذف انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadContracts();
      } catch (requestError) {
        console.error(
          "Delete contract error:",
          requestError
        );

        setActionError(
          "حذف قرارداد با خطا مواجه شد."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleTerminate =
    async () => {
      if (
        !buildingId ||
        !user?.iduser ||
        !selectedContractId
      ) {
        return;
      }

      if (
        !terminateReason.trim()
      ) {
        setActionError(
          "دلیل فسخ را وارد کنید."
        );

        return;
      }

      if (
        !/^\d{4}\/\d{2}\/\d{2}$/.test(
          terminateDate.trim()
        )
      ) {
        setActionError(
          "تاریخ فسخ را به صورت 1404/01/01 وارد کنید."
        );

        return;
      }

      try {
        setSaving(true);

        setActionError("");

        const result =
          await contractApi.terminate(
            buildingId,
            user.iduser,
            selectedContractId,
            terminateReason.trim(),
            terminateDate.trim()
          );

        if (!result.success) {
          setActionError(
            result.message ??
              "فسخ انجام نشد."
          );

          return;
        }

        closeDialog();

        await loadContracts();
      } catch (requestError) {
        console.error(
          "Terminate contract error:",
          requestError
        );

        setActionError(
          "فسخ قرارداد با خطا مواجه شد."
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
            قراردادها
          </h1>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {selectedBuilding?.names ??
              selectedUnit?.names ??
              "ساختمان"}
          </p>
        </div>

        {isManager && (
          <Link
            href="/contracts/new"
            className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            aria-label="قرارداد جدید"
          >
            <Plus className="h-5 w-5" />
          </Link>
        )}
      </div>

      {/* Active / Deactive */}

      <div className="grid grid-cols-2 rounded-xl border p-1">

        <button
          type="button"
          onClick={() =>
            setActive(true)
          }
          className={[
            "rounded-lg px-4 py-3 text-sm font-medium",
            active
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted",
          ].join(" ")}
        >
          قراردادهای فعال
        </button>

        <button
          type="button"
          onClick={() =>
            setActive(false)
          }
          className={[
            "rounded-lg px-4 py-3 text-sm font-medium",
            !active
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted",
          ].join(" ")}
        >
          پایان یافته / فسخ شده
        </button>

      </div>

      {error && (
        <Card>
          <CardContent className="flex gap-3 p-4 text-sm text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      ) : contracts.length ===
        0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            قراردادی برای نمایش وجود ندارد.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">

          {contracts.map(
            (contract) => (
              <Card
                key={
                  contract.idc
                }
              >
                <CardHeader>
                  <div className="flex items-start gap-3">

                    <FileText className="mt-1 h-5 w-5 shrink-0" />

                    <div className="min-w-0 flex-1">
                      <CardTitle>
                        {
                          contract.subject
                        }
                      </CardTitle>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {
                          contract.counterparty
                        }
                      </p>
                    </div>

                    <span className="rounded-full bg-muted px-2 py-1 text-xs">
                      {
                        contract.state
                      }
                    </span>

                  </div>
                </CardHeader>

                <CardContent className="space-y-3">

                  <div className="grid gap-2 text-sm sm:grid-cols-2">

                    <Info
                      label="شروع"
                      value={
                        contract.startDate
                      }
                    />

                    <Info
                      label="پایان"
                      value={
                        contract.endDate
                      }
                    />

                    <Info
                      label="مبلغ"
                      value={
                        formatPrice(
                          contract.price
                        )
                      }
                    />

                    <Info
                      label="تلفن"
                      value={
                        contract.phone
                      }
                    />

                  </div>

                  {contract.address && (
                    <Info
                      label="آدرس"
                      value={
                        contract.address
                      }
                    />
                  )}

                  {contract.description && (
                    <Info
                      label="توضیحات"
                      value={
                        contract.description
                      }
                    />
                  )}

                  {contract.terminateReason && (
                    <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-sm">
                      <p className="font-semibold">
                        دلیل فسخ
                      </p>

                      <p className="mt-1">
                        {
                          contract.terminateReason
                        }
                      </p>

                      {contract.terminateDate && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          تاریخ فسخ:{" "}
                          {
                            contract.terminateDate
                          }
                        </p>
                      )}
                    </div>
                  )}

                  {isManager && (
                    <div className="flex gap-2 border-t pt-3">

                      {contract.state ===
                        "فعال" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setSelectedContractId(
                              contract.idc
                            );

                            setTerminateReason(
                              ""
                            );

                            setTerminateDate(
                              ""
                            );

                            setActionError("");

                            setDialog(
                              "terminate"
                            );
                          }}
                        >
                          فسخ قرارداد
                        </Button>
                      )}

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setSelectedContractId(
                            contract.idc
                          );

                          setActionError("");

                          setDialog(
                            "delete"
                          );
                        }}
                      >
                        <Trash2 className="ml-2 h-4 w-4 text-destructive" />
                        حذف
                      </Button>

                    </div>
                  )}

                  {contract.receipt !==
                    "0" &&
                    contract.receipt && (
                      <a
                        href={contract.receipt}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm underline"
                      >
                        مشاهده قرارداد / فایل پیوست
                      </a>
                    )}

                </CardContent>
              </Card>
            )
          )}

        </div>
      )}

      {/* Delete / Terminate dialog */}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="w-full max-w-md rounded-2xl bg-background p-5 shadow-xl">

            {dialog ===
              "delete" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    حذف قرارداد
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
                  آیا از حذف این قرارداد اطمینان دارید؟
                </p>

                {actionError && (
                  <p className="mt-4 text-sm text-destructive">
                    {
                      actionError
                    }
                  </p>
                )}

                <div className="mt-6 flex gap-3">

                  <Button
                    type="button"
                    variant="destructive"
                    className="flex-1"
                    disabled={saving}
                    onClick={() => {
                      void handleDelete();
                    }}
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

            {dialog ===
              "terminate" && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold">
                    فسخ قرارداد
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
                      تاریخ فسخ
                    </Label>

                    <Input
                      dir="ltr"
                      maxLength={10}
                      placeholder="1404/01/01"
                      value={
                        terminateDate
                      }
                      onChange={(
                        event
                      ) =>
                        setTerminateDate(
                          event.target.value
                        )
                      }
                      disabled={saving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>
                      دلیل فسخ
                    </Label>

                    <Textarea
                      maxLength={150}
                      value={
                        terminateReason
                      }
                      onChange={(
                        event
                      ) =>
                        setTerminateReason(
                          event.target.value
                        )
                      }
                      disabled={saving}
                    />
                  </div>

                  {actionError && (
                    <p className="text-sm text-destructive">
                      {
                        actionError
                      }
                    </p>
                  )}

                </div>

                <div className="mt-6 flex gap-3">

                  <Button
                    type="button"
                    className="flex-1"
                    disabled={saving}
                    onClick={() => {
                      void handleTerminate();
                    }}
                  >
                    {saving
                      ? "در حال ثبت..."
                      : "ثبت فسخ"}
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

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <span className="text-xs text-muted-foreground">
        {label}
      </span>

      <p className="mt-1 font-medium">
        {value || "—"}
      </p>
    </div>
  );
}

function formatPrice(
  value: string
) {
  const numeric =
    Number(
      value.replace(
        /,/g,
        ""
      )
    );

  if (
    Number.isNaN(numeric)
  ) {
    return value;
  }

  return new Intl.NumberFormat(
    "en-US"
  ).format(numeric);
}