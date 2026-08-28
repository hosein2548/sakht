"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  FileUp,
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
  unitApi,
} from "@/src/features/units/api/unit.api";

import {
  expenseCreateApi,
} from "@/src/features/expenses/api/expense-create.api";

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
} from "@/src/components/ui/textarea";

import {
  Button,
} from "@/components/ui/button";

import type {
  UnitSummary,
} from "@/src/features/units/types/unit.types";

import type {
  ExpenseSplit,
} from "@/src/features/expenses/types/expense.types";

const repeatDays = Array.from(
  { length: 29 },
  (_, index) =>
    String(index + 1)
);

const deadlineDays = Array.from(
  { length: 25 },
  (_, index) =>
    String(index + 1)
);

type CalculationType =
  | "metter"
  | "vahed"
  | "nafar";

type Payer =
  | "malek"
  | "saken";

type UnitScope =
  | "all"
  | "khas";

type EmptyUnitPayment =
  | "sayer"
  | "malek";

export default function NewExpensePage() {
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

  const buildingId =
    selectedBuilding?.ids ??
    selectedUnit?.ids ??
    "";

  const [step, setStep] =
    useState(1);

  const [name, setName] =
    useState("");

  const [
    paymentType,
    setPaymentType,
  ] = useState<
    "justone" | "every"
  >("justone");

  const [
    repeatDay,
    setRepeatDay,
  ] = useState("1");

  const [
    source,
    setSource,
  ] = useState<
    "sandogh" | "vahed"
  >("sandogh");

  const [
    calculationType,
    setCalculationType,
  ] =
    useState<CalculationType>(
      "metter"
    );

  const [payer, setPayer] =
    useState<Payer>("malek");

  const [unitScope, setUnitScope] =
    useState<UnitScope>("all");

  const [
    emptyUnitPayment,
    setEmptyUnitPayment,
  ] =
    useState<EmptyUnitPayment>(
      "sayer"
    );

  const [price, setPrice] =
    useState("");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [
    paymentDeadline,
    setPaymentDeadline,
  ] = useState("1");

  const [comment, setComment] =
    useState("");

  const [units, setUnits] =
    useState<UnitSummary[]>([]);

  const [
    selectedUnitIds,
    setSelectedUnitIds,
  ] = useState<string[]>(
    []
  );

  const [
    loadingUnits,
    setLoadingUnits,
  ] = useState(false);

  const [
    previewLoading,
    setPreviewLoading,
  ] = useState(false);

  const [
    saveLoading,
    setSaveLoading,
  ] = useState(false);

  const [
    previewItems,
    setPreviewItems,
  ] = useState<
    ExpenseSplit[]
  >([]);

  const [
    receipt,
    setReceipt,
  ] = useState<File | null>(
    null
  );

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState(false);

  /*
   * دریافت همه واحدها
   */
  useEffect(() => {
    if (
      !buildingId ||
      source !== "vahed"
    ) {
      return;
    }

    const loadUnits =
      async () => {
        try {
          setLoadingUnits(
            true
          );

          const result =
            await unitApi.getAll(
              buildingId
            );

          setUnits(result);
        } catch (requestError) {
          console.error(
            "Expense units error:",
            requestError
          );

          setError(
            "دریافت واحدها با خطا مواجه شد."
          );
        } finally {
          setLoadingUnits(
            false
          );
        }
      };

    void loadUnits();
  }, [
    buildingId,
    source,
  ]);

  const formattedPrice =
    price.replace(
      /,/g,
      ""
    );

  const toggleUnit = (
    idv: string
  ) => {
    setSelectedUnitIds(
      (current) =>
        current.includes(idv)
          ? current.filter(
              (id) =>
                id !== idv
            )
          : [
              ...current,
              idv,
            ]
    );
  };

  const validateStepOne =
    () => {
      if (!name.trim()) {
        setError(
          "نام هزینه را وارد کنید."
        );

        return false;
      }

      setError("");

      return true;
    };

  const validateStepThree =
    () => {
      if (!formattedPrice) {
        setError(
          "مبلغ کل هزینه را وارد کنید."
        );

        return false;
      }

      if (
        !dateFrom ||
        dateFrom.length !== 10
      ) {
        setError(
          "تاریخ شروع هزینه را وارد کنید."
        );

        return false;
      }

      if (
        !dateTo ||
        dateTo.length !== 10
      ) {
        setError(
          "تاریخ پایان هزینه را وارد کنید."
        );

        return false;
      }

      setError("");

      return true;
    };

  const goNext =
    () => {
      if (step === 1) {
        if (
          !validateStepOne()
        ) {
          return;
        }

        /*
         * اگر از صندوق است،
         * مستقیماً به مرحله مبلغ می‌رویم.
         */
        if (
          source === "sandogh"
        ) {
          setStep(3);
        } else {
          setStep(2);
        }

        return;
      }

      if (step === 2) {
        setStep(3);

        return;
      }

      if (step === 3) {
        if (
          !validateStepThree()
        ) {
          return;
        }

        setStep(4);

        return;
      }
    };

  const goBack =
    () => {
      setError("");

      if (step === 1) {
        return;
      }

      if (
        step === 3 &&
        source ===
          "sandogh"
      ) {
        setStep(1);

        return;
      }

      setStep(
        (current) =>
          current - 1
      );
    };

  /*
   * پیش‌نمایش محاسبه
   */
  const generatePreview =
    async () => {
      if (
        !buildingId
      ) {
        return;
      }

      if (
        !validateStepThree()
      ) {
        setStep(3);

        return;
      }

      try {
        setPreviewLoading(
          true
        );

        setError("");

        const result =
          await expenseCreateApi.preview(
            {
              buildingId,

              calculationType,

              payer,

              unitScope,

              selectedUnitIds,

              emptyUnitPayment,

              dateFrom,

              dateTo,

              price:
                formattedPrice,
            }
          );

        if (
          result.length ===
          0
        ) {
          setError(
            "هیچ واحدی مشمول این هزینه نمی‌شود."
          );

          return;
        }

        setPreviewItems(
          result
        );

        setStep(5);
      } catch (requestError) {
        console.error(
          "Expense preview error:",
          requestError
        );

        setError(
          "محاسبه هزینه با خطا مواجه شد."
        );
      } finally {
        setPreviewLoading(
          false
        );
      }
    };

  /*
   * ثبت نهایی
   */
  const handleSave =
    async () => {
      if (
        !buildingId ||
        !user?.iduser
      ) {
        return;
      }

      try {
        setSaveLoading(
          true
        );

        setError("");

        const result =
          await expenseCreateApi.save(
            {
              buildingId,

              userId:
                user.iduser,

              name:
                name.trim(),

              paymentType,

              repeatDay,

              calculationType,

              payer,

              unitScope,

              selectedUnitIds,

              emptyUnitPayment,

              dateFrom,

              dateTo,

              price:
                formattedPrice,

              paymentDeadline,

              comment:
                comment.trim(),

              calculatedItems:
                previewItems,

              receipt,
            }
          );

        if (!result.success) {
          setError(
            result.message ??
              "ثبت هزینه انجام نشد."
          );

          return;
        }

        setSuccess(true);
      } catch (requestError) {
        console.error(
          "Save expense error:",
          requestError
        );

        setError(
          "ثبت هزینه با خطا مواجه شد."
        );
      } finally {
        setSaveLoading(
          false
        );
      }
    };

  if (success) {
    return (
      <div
        dir="rtl"
        className="flex min-h-[70vh] items-center justify-center px-4"
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">

            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Check className="h-7 w-7 text-primary" />
            </div>

            <h1 className="text-xl font-bold">
              هزینه با موفقیت ثبت شد
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              اطلاعات هزینه با موفقیت در ساختمان ثبت شد.
            </p>

            <Link
              href="/costs"
              className="mt-6 flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              بازگشت به هزینه‌ها
            </Link>

          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="space-y-5 px-4 py-5"
    >
      {/* Header */}

      <div className="flex items-center gap-3">
        <Link
          href="/costs"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-xl font-bold">
            ثبت هزینه جدید
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            مرحله {step} از 5
          </p>
        </div>
      </div>

      {/* Error */}

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* STEP 1 */}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>
              اطلاعات اولیه هزینه
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-2">
              <Label>
                نام هزینه
              </Label>

              <Input
                maxLength={30}
                value={name}
                onChange={(event) =>
                  setName(
                    event.target.value
                  )
                }
                placeholder="مثلاً هزینه نظافت"
              />
            </div>

            <div className="space-y-3">
              <Label>
                منبع هزینه
              </Label>

              <Choice
                selected={
                  source ===
                  "sandogh"
                }
                onClick={() =>
                  setSource(
                    "sandogh"
                  )
                }
                title="برداشت از صندوق"
              />

              <Choice
                selected={
                  source ===
                  "vahed"
                }
                onClick={() =>
                  setSource(
                    "vahed"
                  )
                }
                title="دریافت از واحدها"
              />
            </div>

            {source ===
              "vahed" && (
              <>
                <div className="space-y-3">
                  <Label>
                    محاسبه بر اساس
                  </Label>

                  <Choice
                    selected={
                      calculationType ===
                      "metter"
                    }
                    onClick={() => {
                      setCalculationType(
                        "metter"
                      );

                      setPayer(
                        "malek"
                      );
                    }}
                    title="متراژ"
                  />

                  <Choice
                    selected={
                      calculationType ===
                      "vahed"
                    }
                    onClick={() => {
                      setCalculationType(
                        "vahed"
                      );

                      setPayer(
                        "malek"
                      );
                    }}
                    title="واحد"
                  />

                  <Choice
                    selected={
                      calculationType ===
                      "nafar"
                    }
                    onClick={() => {
                      setCalculationType(
                        "nafar"
                      );

                      setPayer(
                        "saken"
                      );
                    }}
                    title="نفر"
                  />
                </div>

                <div className="space-y-3">
                  <Label>
                    پرداخت کننده
                  </Label>

                  {(calculationType ===
                    "metter" ||
                    calculationType ===
                      "vahed") && (
                    <Choice
                      selected={
                        payer ===
                        "malek"
                      }
                      onClick={() =>
                        setPayer(
                          "malek"
                        )
                      }
                      title="مالک"
                    />
                  )}

                  <Choice
                    selected={
                      payer ===
                      "saken"
                    }
                    onClick={() =>
                      setPayer(
                        "saken"
                      )
                    }
                    title="ساکن"
                  />
                </div>
              </>
            )}

            {source ===
              "vahed" && (
              <div className="space-y-3">
                <Label>
                  نوع پرداخت
                </Label>

                <Choice
                  selected={
                    paymentType ===
                    "justone"
                  }
                  onClick={() =>
                    setPaymentType(
                      "justone"
                    )
                  }
                  title="یکبار"
                />

                <Choice
                  selected={
                    paymentType ===
                    "every"
                  }
                  onClick={() =>
                    setPaymentType(
                      "every"
                    )
                  }
                  title="هر ماه"
                />

                {paymentType ===
                  "every" && (
                  <div className="space-y-2">
                    <Label>
                      چه روزی از ماه تکرار شود
                    </Label>

                    <select
                      value={
                        repeatDay
                      }
                      onChange={(event) =>
                        setRepeatDay(
                          event.target.value
                        )
                      }
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                    >
                      {repeatDays.map(
                        (day) => (
                          <option
                            key={day}
                            value={day}
                          >
                            {day}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                )}
              </div>
            )}

            {source ===
              "sandogh" && (
              <div className="space-y-3">
                <Label>
                  نوع پرداخت
                </Label>

                <Choice
                  selected={
                    paymentType ===
                    "justone"
                  }
                  onClick={() =>
                    setPaymentType(
                      "justone"
                    )
                  }
                  title="یکبار"
                />

                <Choice
                  selected={
                    paymentType ===
                    "every"
                  }
                  onClick={() =>
                    setPaymentType(
                      "every"
                    )
                  }
                  title="هر ماه"
                />
              </div>
            )}

          </CardContent>
        </Card>
      )}

      {/* STEP 2 */}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>
              انتخاب واحدها
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-3">

              <Choice
                selected={
                  unitScope ===
                  "all"
                }
                onClick={() =>
                  setUnitScope(
                    "all"
                  )
                }
                title="همه واحدها"
              />

              <Choice
                selected={
                  unitScope ===
                  "khas"
                }
                onClick={() =>
                  setUnitScope(
                    "khas"
                  )
                }
                title="واحدهای خاص"
              />

            </div>

            {unitScope ===
              "khas" && (
              <div className="space-y-2">

                {loadingUnits ? (
                  <div className="flex justify-center py-8">
                    <div className="h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : units.length ===
                  0 ? (
                  <p className="text-sm text-muted-foreground">
                    واحدی پیدا نشد.
                  </p>
                ) : (
                  units.map(
                    (unit) => (
                      <button
                        key={
                          unit.idv
                        }
                        type="button"
                        onClick={() =>
                          toggleUnit(
                            unit.idv
                          )
                        }
                        className={[
                          "flex w-full items-center justify-between rounded-xl border p-3 text-right",
                          selectedUnitIds.includes(
                            unit.idv
                          )
                            ? "border-primary bg-primary/10"
                            : "hover:bg-muted",
                        ].join(" ")}
                      >
                        <span>
                          واحد{" "}
                          {unit.namev}
                        </span>

                        {selectedUnitIds.includes(
                          unit.idv
                        ) && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </button>
                    )
                  )
                )}

              </div>
            )}

            {payer ===
              "saken" &&
              (
                calculationType ===
                  "metter" ||
                calculationType ===
                  "vahed"
              ) && (
                <div className="space-y-3">
                  <Label>
                    هزینه واحد بدون ساکن بر عهده
                  </Label>

                  <Choice
                    selected={
                      emptyUnitPayment ===
                      "sayer"
                    }
                    onClick={() =>
                      setEmptyUnitPayment(
                        "sayer"
                      )
                    }
                    title="سایر واحدها"
                  />

                  <Choice
                    selected={
                      emptyUnitPayment ===
                      "malek"
                    }
                    onClick={() =>
                      setEmptyUnitPayment(
                        "malek"
                      )
                    }
                    title="مالک واحد"
                  />
                </div>
              )}

          </CardContent>
        </Card>
      )}

      {/* STEP 3 */}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>
              مبلغ و تاریخ هزینه
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">

            <div className="space-y-2">
              <Label>
                مبلغ کل هزینه
              </Label>

              <Input
                dir="ltr"
                inputMode="numeric"
                value={price}
                onChange={(event) => {
                  const numeric =
                    event.target.value.replace(
                      /\D/g,
                      ""
                    );

                  setPrice(
                    new Intl.NumberFormat(
                      "en-US"
                    ).format(
                      Number(
                        numeric || "0"
                      )
                    )
                  );
                }}
              />
            </div>

            <div className="space-y-2">
              <Label>
                تاریخ شروع هزینه
              </Label>

              <Input
                dir="ltr"
                maxLength={10}
                placeholder="1404/01/01"
                value={
                  dateFrom
                }
                onChange={(event) =>
                  setDateFrom(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                تاریخ پایان هزینه
              </Label>

              <Input
                dir="ltr"
                maxLength={10}
                placeholder="1404/01/31"
                value={
                  dateTo
                }
                onChange={(event) =>
                  setDateTo(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label>
                مهلت پرداخت از امروز
              </Label>

              <select
                value={
                  paymentDeadline
                }
                onChange={(event) =>
                  setPaymentDeadline(
                    event.target.value
                  )
                }
                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                {deadlineDays.map(
                  (day) => (
                    <option
                      key={day}
                      value={day}
                    >
                      {day} روز
                    </option>
                  )
                )}
              </select>
            </div>

            {source ===
              "sandogh" && (
              <div className="space-y-2">
                <Label>
                  توضیحات
                </Label>

                <Textarea
                  maxLength={150}
                  value={comment}
                  onChange={(event) =>
                    setComment(
                      event.target.value
                    )
                  }
                />
              </div>
            )}

            <div className="rounded-xl border p-4">

              <div className="flex items-center gap-3">

                <FileUp className="h-5 w-5" />

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    رسید هزینه
                  </p>

                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {receipt?.name ??
                      "فایلی انتخاب نشده است"}
                  </p>
                </div>

                {receipt && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setReceipt(
                        null
                      )
                    }
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}

              </div>

              <Input
                type="file"
                accept="image/*"
                className="mt-3"
                onChange={(
                  event
                ) =>
                  setReceipt(
                    event.target.files?.[0] ??
                      null
                  )
                }
              />

            </div>

          </CardContent>
        </Card>
      )}

      {/* STEP 4 */}

      {step === 4 && (
        <Card>
          <CardContent className="flex min-h-[50vh] flex-col items-center justify-center text-center">

            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <span className="text-3xl font-bold">
                %
              </span>
            </div>

            <h2 className="text-lg font-bold">
              آماده محاسبه
            </h2>

            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              اکنون سهم هر واحد بر اساس اطلاعات انتخاب‌شده از سرور محاسبه می‌شود.
            </p>

            <Button
              type="button"
              className="mt-6"
              disabled={
                previewLoading
              }
              onClick={() => {
                void generatePreview();
              }}
            >
              {previewLoading
                ? "در حال محاسبه..."
                : "پیش نمایش هزینه"}
            </Button>

          </CardContent>
        </Card>
      )}

      {/* STEP 5 */}

      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>
              پیش‌نمایش هزینه
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">

            {previewItems.map(
              (item) => (
                <div
                  key={item.idv}
                  className="rounded-xl border p-4"
                >
                  <div className="flex items-center justify-between">

                    <span className="font-semibold">
                      نام واحد:{" "}
                      {item.namev}
                    </span>

                    <span className="font-semibold">
                      مبلغ:{" "}
                      {formatPrice(
                        item.price
                      )}
                    </span>

                  </div>

                  <div className="mt-2 text-sm text-muted-foreground">

                    پرداخت کننده:{" "}
                    {item.naghsh ===
                    "malek"
                      ? "مالک"
                      : "ساکن"}

                  </div>

                </div>
              )
            )}

            <div className="flex gap-3 pt-4">

              <Button
                type="button"
                className="flex-1"
                disabled={
                  saveLoading
                }
                onClick={() => {
                  void handleSave();
                }}
              >
                {saveLoading
                  ? "در حال ثبت..."
                  : "تأیید و اعمال هزینه"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={
                  saveLoading
                }
                onClick={() =>
                  setStep(1)
                }
              >
                انصراف
              </Button>

            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}

      {step !== 5 && (
        <div className="flex items-center justify-between">

          <Button
            type="button"
            variant="outline"
            disabled={
              step === 1 ||
              previewLoading ||
              saveLoading
            }
            onClick={
              goBack
            }
          >
            <ChevronRight className="ml-2 h-4 w-4" />
            قبلی
          </Button>

          {step < 4 && (
            <Button
              type="button"
              onClick={
                goNext
              }
              disabled={
                previewLoading ||
                saveLoading
              }
            >
              بعدی
              <ChevronLeft className="mr-2 h-4 w-4" />
            </Button>
          )}

        </div>
      )}

      {step === 5 && (
        <div className="flex justify-start">
          <Button
            type="button"
            variant="outline"
            disabled={
              saveLoading
            }
            onClick={() =>
              setStep(4)
            }
          >
            <ChevronRight className="ml-2 h-4 w-4" />
            بازگشت
          </Button>
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        {selectedBuilding?.names ??
          "ساختمان"}
      </div>
    </div>
  );
}

function Choice({
  selected,
  title,
  onClick,
}: {
  selected: boolean;

  title: string;

  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={[
        "flex w-full items-center justify-between rounded-xl border p-4 text-right transition",
        selected
          ? "border-primary bg-primary/10"
          : "hover:bg-muted",
      ].join(" ")}
    >
      <span className="font-medium">
        {title}
      </span>

      {selected && (
        <Check className="h-5 w-5 text-primary" />
      )}
    </button>
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