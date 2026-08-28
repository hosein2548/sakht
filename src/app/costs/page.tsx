"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  Eye,
  Plus,
  Trash2,
} from "lucide-react";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  expenseApi,
} from "@/src/features/expenses/api/expense.api";

import {
  useExpenseStore,
} from "@/src/features/expenses/store/expense.store";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CostsPage() {
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

  const expenses =
    useExpenseStore(
      (state) => state.expenses
    );

  const isLoading =
    useExpenseStore(
      (state) => state.isLoading
    );

  const error =
    useExpenseStore(
      (state) => state.error
    );

  const setExpenses =
    useExpenseStore(
      (state) => state.setExpenses
    );

  const setLoading =
    useExpenseStore(
      (state) => state.setLoading
    );

  const setError =
    useExpenseStore(
      (state) => state.setError
    );

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    deleteMessage,
    setDeleteMessage,
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

  const loadExpenses =
    async () => {
      if (!buildingId) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const result =
          await expenseApi.getAll(
            buildingId
          );

        setExpenses(result);
      } catch (requestError) {
        console.error(
          "Expenses loading error:",
          requestError
        );

        setError(
          "دریافت لیست هزینه‌ها با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadExpenses();

    // فقط با تغییر ساختمان/واحد دوباره دریافت شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId]);

  const handleDelete =
    async (
      expenseId: string
    ) => {
      const confirmed =
        window.confirm(
          "آیا از حذف این هزینه اطمینان دارید؟"
        );

      if (!confirmed) {
        return;
      }

      if (!buildingId) {
        return;
      }

      try {
        setDeletingId(
          expenseId
        );

        setDeleteMessage("");

        const result =
          await expenseApi.remove(
            buildingId,
            expenseId
          );

        if (!result.success) {
          setDeleteMessage(
            result.message ??
              "حذف انجام نشد."
          );

          return;
        }

        await loadExpenses();
      } catch (requestError) {
        console.error(
          "Delete expense error:",
          requestError
        );

        setDeleteMessage(
          "حذف هزینه با خطا مواجه شد."
        );
      } finally {
        setDeletingId("");
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
            هزینه‌ها
          </h1>

          <p className="mt-1 truncate text-sm text-muted-foreground">
            {selectedBuilding?.names ??
              selectedUnit?.names ??
              "ساختمان"}
          </p>
        </div>

        {isManager && (
  <Link
    href="/costs/new"
    className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
    aria-label="افزودن هزینه"
  >
    <Plus className="h-5 w-5" />
  </Link>
)}
      </div>

      {!buildingId && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            ابتدا یک ساختمان را انتخاب کنید.
          </CardContent>
        </Card>
      )}

      {deleteMessage && (
        <div className="rounded-lg border border-destructive/30 p-3 text-sm text-destructive">
          {deleteMessage}
        </div>
      )}

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
                void loadExpenses();
              }}
            >
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      )}

      {buildingId &&
        !error &&
        isLoading && (
          <Card>
            <CardContent className="flex min-h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </CardContent>
          </Card>
        )}

      {buildingId &&
        !error &&
        !isLoading &&
        expenses.length ===
          0 && (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              تا این لحظه هزینه‌ای ثبت نشده است.
            </CardContent>
          </Card>
        )}

      {!isLoading &&
        expenses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                لیست هزینه‌ها
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">

              <div className="divide-y">
                {expenses.map(
                  (expense) => (
                    <div
                      key={
                        expense.idhazine
                      }
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">

                        <div className="min-w-0 flex-1">

                          <p className="font-semibold">
                            نام هزینه:{" "}
                            {expense.name}
                          </p>

                          <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">

                            <span>
                              مبلغ:{" "}
                              {formatPrice(
                                expense.price
                              )}
                            </span>

                            <span>
                              {expense.getfrom ===
                              "sandogh"
                                ? "برداشت از صندوق"
                                : "دریافت از واحدها"}
                            </span>

                            <span>
                              تاریخ از:{" "}
                              {
                                expense.startdate
                              }
                            </span>

                            <span>
                              تاریخ تا:{" "}
                              {
                                expense.enddate
                              }
                            </span>

                          </div>

                        </div>

                        <div className="flex shrink-0 gap-1">

                          <Link
                            href={`/costs/${expense.idhazine}`}
                            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
                            title="مشاهده تقسیم‌بندی"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>

                          {isManager && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              disabled={
                                deletingId ===
                                expense.idhazine
                              }
                              onClick={() => {
                                void handleDelete(
                                  expense.idhazine
                                );
                              }}
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}

                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

            </CardContent>
          </Card>
        )}
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