"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronDown,
  CreditCard,
  FileImage,
  Plus,
  X,
} from "lucide-react";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  unitApi,
} from "@/src/features/units/api/unit.api";

import {
  paymentApi,
  type PaymentSearch,
} from "@/src/features/payments/api/payment.api";

import {
  usePaymentStore,
} from "@/src/features/payments/store/payment.store";

import type {
  UnitSummary,
} from "@/src/features/units/types/unit.types";

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

export default function PaymentsPage() {
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

  const payments =
    usePaymentStore(
      (state) => state.payments
    );

  const isLoading =
    usePaymentStore(
      (state) => state.isLoading
    );

  const error =
    usePaymentStore(
      (state) => state.error
    );

  const setPayments =
    usePaymentStore(
      (state) =>
        state.setPayments
    );

  const setLoading =
    usePaymentStore(
      (state) =>
        state.setLoading
    );

  const setError =
    usePaymentStore(
      (state) =>
        state.setError
    );

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

  const [
    search,
    setSearch,
  ] = useState<PaymentSearch>(
    "all"
  );

  const [
    units,
    setUnits,
  ] = useState<
    UnitSummary[]
  >([]);

  const [
    selectedPaymentUnit,
    setSelectedPaymentUnit,
  ] = useState("");

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    dialogError,
    setDialogError,
  ] = useState("");

  const [
    payer,
    setPayer,
  ] = useState<
    "malek" | "saken"
  >("saken");

  const [
    paymentType,
    setPaymentType,
  ] = useState<
    "naghdi" | "enteghal"
  >("naghdi");

  const [title, setTitle] =
    useState("");

  const [date, setDate] =
    useState("");

  const [price, setPrice] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    receipt,
    setReceipt,
  ] = useState<File | null>(
    null
  );

  /*
   * واحدهای ساختمان
   */
  useEffect(() => {
    if (
      !buildingId ||
      !isManager
    ) {
      return;
    }

    const loadUnits =
      async () => {
        try {
          const result =
            await unitApi.getAll(
              buildingId
            );

          setUnits(result);

          if (
            result.length > 0 &&
            !selectedPaymentUnit
          ) {
            setSelectedPaymentUnit(
              result[0].idv
            );
          }
        } catch (error) {
          console.error(
            "Payment units error:",
            error
          );
        }
      };

    void loadUnits();
  }, [
    buildingId,
    isManager,
    selectedPaymentUnit,
  ]);

  /*
   * دریافت پرداختی
   */
  const loadPayments =
    async () => {
      if (
        !buildingId ||
        !user?.iduser
      ) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const role =
          isManager
            ? "modir"
            : "maleksaken";

        const unitId =
          isManager
            ? selectedPaymentUnit
            : selectedUnit?.idv ??
              "";

        const result =
          await paymentApi.getAll(
            buildingId,
            role,
            unitId,
            search
          );

        setPayments(
          result
        );
      } catch (requestError) {
        console.error(
          "Payments loading error:",
          requestError
        );

        setError(
          "دریافت پرداختی‌ها با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadPayments();

    // عمداً فقط با تغییر فیلتر/واحد دوباره دریافت شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    buildingId,
    search,
    selectedPaymentUnit,
    user?.iduser,
  ]);

  const resetDialog =
    () => {
      setDialogOpen(false);

      setSaving(false);

      setDialogError("");

      setTitle("");

      setDate("");

      setPrice("");

      setDescription("");

      setReceipt(null);
    };

  const handleSave =
    async () => {
      if (
        !buildingId ||
        !user?.iduser
      ) {
        return;
      }

      const unitId =
        isManager
          ? selectedPaymentUnit
          : selectedUnit?.idv ??
            "";

      if (!unitId) {
        setDialogError(
          "واحد پرداخت‌کننده مشخص نیست."
        );

        return;
      }

      if (!title.trim()) {
        setDialogError(
          "عنوان پرداخت را وارد کنید."
        );

        return;
      }

      if (
        !/^\d{4}\/\d{2}\/\d{2}$/.test(
          date.trim()
        )
      ) {
        setDialogError(
          "تاریخ را به صورت 1404/01/01 وارد کنید."
        );

        return;
      }

      if (
        !price.replace(
          /,/g,
          ""
        )
      ) {
        setDialogError(
          "مبلغ را وارد کنید."
        );

        return;
      }

      try {
        setSaving(true);

        setDialogError("");

        const result =
          await paymentApi.create(
            {
              buildingId,

              unitId,

              userId:
                user.iduser,

              payer,

              date:
                date.trim(),

              price:
                price.replace(
                  /,/g,
                  ""
                ),

              title:
                title.trim(),

              paymentType,

              receipt,
            }
          );

        if (!result.success) {
          setDialogError(
            result.message ??
              "ثبت پرداخت انجام نشد."
          );

          return;
        }

        resetDialog();

        await loadPayments();
      } catch (requestError) {
        console.error(
          "Save payment error:",
          requestError
        );

        setDialogError(
          "ثبت پرداخت با خطا مواجه شد."
        );
      } finally {
        setSaving(false);
      }
    };

  const handleReply =
    async (
      paymentId: string,
      reply:
        | "ok"
        | "no"
        | "del"
        | "deletepay"
    ) => {
      if (
        !buildingId ||
        !user?.iduser
      ) {
        return;
      }

      const text =
        reply === "ok"
          ? "آیا از تایید این پرداخت اطمینان دارید؟"
          : reply === "no"
            ? "آیا از رد این پرداخت اطمینان دارید؟"
            : "آیا از حذف این پرداخت اطمینان دارید؟";

      const confirmed =
        window.confirm(text);

      if (!confirmed) {
        return;
      }

      try {
        const result =
          await paymentApi.reply(
            {
              buildingId,

              paymentId,

              role:
                isManager
                  ? "modir"
                  : "maleksaken",

              reply,

              description: "",
            }
          );

        if (!result.success) {
          setError(
            result.message ??
              "عملیات انجام نشد."
          );

          return;
        }

        await loadPayments();
      } catch (requestError) {
        console.error(
          "Payment reply error:",
          requestError
        );

        setError(
          "انجام عملیات با خطا مواجه شد."
        );
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
            پرداختی‌ها
          </h1>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {selectedBuilding?.names ??
              selectedUnit?.names ??
              "ساختمان"}
          </p>
        </div>

        <Button
          type="button"
          size="icon"
          onClick={() =>
            setDialogOpen(true)
          }
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {/* فیلتر مدیر */}

      {isManager && (
        <Card>
          <CardContent className="space-y-4 p-4">

            <div className="space-y-2">
              <Label>
                نمایش
              </Label>

              <select
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target
                      .value as PaymentSearch
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="all">
                  کل پرداختی‌های ساختمان
                </option>

                <option value="baresi">
                  پرداختی‌های درحال بررسی
                </option>

                <option value="vahed">
                  یک واحد
                </option>
              </select>
            </div>

            {search ===
              "vahed" && (
              <div className="space-y-2">
                <Label>
                  واحد
                </Label>

                <select
                  value={
                    selectedPaymentUnit
                  }
                  onChange={(event) =>
                    setSelectedPaymentUnit(
                      event.target
                        .value
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  {units.map(
                    (unit) => (
                      <option
                        key={
                          unit.idv
                        }
                        value={
                          unit.idv
                        }
                      >
                        {unit.namev}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* Error */}

      {error && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-destructive" />

            <span className="flex-1 text-sm text-destructive">
              {error}
            </span>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void loadPayments();
              }}
            >
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}

      {isLoading && (
        <Card>
          <CardContent className="flex min-h-40 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      )}

      {/* Empty */}

      {!isLoading &&
        !error &&
        payments.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              پرداختی تا این لحظه ثبت نشده است.
            </CardContent>
          </Card>
        )}

      {/* List */}

      {!isLoading &&
        payments.length > 0 && (
          <div className="space-y-3">
            {payments.map(
              (payment) => (
                <Card
                  key={
                    payment.idp
                  }
                >
                  <CardContent className="space-y-3 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <CreditCard className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="font-semibold">
                          {
                            payment.title
                          }
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          مبلغ:{" "}
                          {formatPrice(
                            payment.price
                          )}
                        </p>

                      </div>

                      <StatusBadge
                        status={
                          payment.status
                        }
                      />

                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">

                      <span>
                        تاریخ پرداخت:{" "}
                        {
                          payment.datepay
                        }
                      </span>

                      <span>
                        تاریخ ثبت:{" "}
                        {
                          payment.datesave
                        }
                      </span>

                      <span>
                        واحد:{" "}
                        {
                          payment.namevahed
                        }
                      </span>

                      <span>
                        پرداخت‌کننده:{" "}
                        {
                          payment.payer
                        }
                      </span>

                      <span>
                        نوع پرداخت:{" "}
                        {
                          payment.paymentType
                        }
                      </span>

                    </div>

                    {payment.status ===
                      "رد شده" &&
                      payment.description && (
                        <div className="rounded-lg bg-muted p-3 text-sm">
                          توضیحات:{" "}
                          {
                            payment.description
                          }
                        </div>
                      )}

                    {payment.receipt !==
                      "0" &&
                      payment.receipt && (
                        <div className="flex items-center gap-2 text-sm">
                          <FileImage className="h-4 w-4" />

                          <a
                            href={`https://web120.ir/apartment/${payment.receipt}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium underline"
                          >
                            مشاهده ضمیمه
                          </a>
                        </div>
                      )}

                    {isManager &&
                      payment.status ===
                        "درحال بررسی" && (
                        <div className="flex gap-2 border-t pt-3">

                          <Button
                            type="button"
                            size="sm"
                            onClick={() =>
                              void handleReply(
                                payment.idp,
                                "ok"
                              )
                            }
                          >
                            <Check className="ml-2 h-4 w-4" />
                            تایید
                          </Button>

                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() =>
                              void handleReply(
                                payment.idp,
                                "no"
                              )
                            }
                          >
                            رد
                          </Button>

                        </div>
                      )}

                    {!isManager &&
                      payment.status ===
                        "درحال بررسی" && (
                        <div className="flex justify-end border-t pt-3">

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              void handleReply(
                                payment.idp,
                                "del"
                              )
                            }
                          >
                            <X className="ml-2 h-4 w-4" />
                            حذف پرداخت
                          </Button>

                        </div>
                      )}

                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}

      {/* ثبت پرداخت */}

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">

          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-background p-5 shadow-xl">

            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                ثبت پرداختی
              </h2>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={
                  resetDialog
                }
                disabled={saving}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="mt-5 space-y-4">

              {isManager && (
                <div className="space-y-2">
                  <Label>
                    واحد
                  </Label>

                  <select
                    value={
                      selectedPaymentUnit
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedPaymentUnit(
                        event.target
                          .value
                      )
                    }
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    {units.map(
                      (unit) => (
                        <option
                          key={
                            unit.idv
                          }
                          value={
                            unit.idv
                          }
                        >
                          {unit.namev}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <Label>
                  عنوان پرداخت
                </Label>

                <Input
                  maxLength={30}
                  value={title}
                  onChange={(event) =>
                    setTitle(
                      event.target
                        .value
                    )
                  }
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  پرداخت‌کننده
                </Label>

                <select
                  value={payer}
                  onChange={(event) =>
                    setPayer(
                      event.target
                        .value as
                        | "malek"
                        | "saken"
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={saving}
                >
                  <option value="saken">
                    ساکن
                  </option>

                  <option value="malek">
                    مالک
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  نوع پرداخت
                </Label>

                <select
                  value={
                    paymentType
                  }
                  onChange={(event) =>
                    setPaymentType(
                      event.target
                        .value as
                        | "naghdi"
                        | "enteghal"
                    )
                  }
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  disabled={saving}
                >
                  <option value="naghdi">
                    نقدی
                  </option>

                  <option value="enteghal">
                    انتقال وجه
                  </option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>
                  مبلغ
                </Label>

                <Input
                  dir="ltr"
                  inputMode="numeric"
                  value={
                    price
                  }
                  onChange={(event) =>
                    setPrice(
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  تاریخ پرداخت
                </Label>

                <Input
                  dir="ltr"
                  maxLength={10}
                  placeholder="1404/01/01"
                  value={date}
                  onChange={(event) =>
                    setDate(
                      event.target
                        .value
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
                  maxLength={50}
                  value={
                    description
                  }
                  onChange={(
                    event
                  ) =>
                    setDescription(
                      event.target
                        .value
                    )
                  }
                  disabled={saving}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  رسید
                </Label>

                <Input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setReceipt(
                      event.target
                        .files?.[0] ??
                        null
                    )
                  }
                  disabled={saving}
                />
              </div>

              {dialogError && (
                <p className="text-sm text-destructive">
                  {dialogError}
                </p>
              )}

              <div className="flex gap-3 pt-2">

                <Button
                  type="button"
                  className="flex-1"
                  disabled={saving}
                  onClick={() => {
                    void handleSave();
                  }}
                >
                  {saving
                    ? "در حال ثبت..."
                    : "ثبت پرداخت"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  disabled={saving}
                  onClick={
                    resetDialog
                  }
                >
                  انصراف
                </Button>

              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  let className =
    "rounded-full px-2 py-1 text-xs";

  if (
    status ===
    "تایید شده"
  ) {
    className +=
      " bg-success/15 text-success";
  } else if (
    status === "رد شده"
  ) {
    className +=
      " bg-destructive/10 text-destructive";
  } else {
    className +=
      " bg-warning/15 text-warning";
  }

  return (
    <span
      className={className}
    >
      {status || "نامشخص"}
    </span>
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