"use client";

import {
  useEffect,
} from "react";

import Link from "next/link";

import {
  ArrowRight,
  Calculator,
} from "lucide-react";

import { useParams } from "next/navigation";

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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ExpenseSplitPage() {
  const params =
    useParams<{
      id: string;
    }>();

  const expenseId =
    params.id;

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

  const selectedExpense =
    useExpenseStore(
      (state) =>
        state.selectedExpense
    );

  const splitItems =
    useExpenseStore(
      (state) => state.splitItems
    );

  const isLoadingSplit =
    useExpenseStore(
      (state) =>
        state.isLoadingSplit
    );

  const splitError =
    useExpenseStore(
      (state) =>
        state.splitError
    );

  const setSelectedExpense =
    useExpenseStore(
      (state) =>
        state.setSelectedExpense
    );

  const setSplitItems =
    useExpenseStore(
      (state) =>
        state.setSplitItems
    );

  const setLoadingSplit =
    useExpenseStore(
      (state) =>
        state.setLoadingSplit
    );

  const setSplitError =
    useExpenseStore(
      (state) =>
        state.setSplitError
    );

  const buildingId =
    selectedBuilding?.ids ??
    selectedUnit?.ids ??
    "";

  useEffect(() => {
    if (
      !buildingId ||
      !expenseId
    ) {
      return;
    }

    const expense =
      expenses.find(
        (item) =>
          item.idhazine ===
          expenseId
      );

    setSelectedExpense(
      expense ?? null
    );

    const loadSplit =
      async () => {
        try {
          setLoadingSplit(
            true
          );

          setSplitError(
            null
          );

          const result =
            await expenseApi.getSplit(
              buildingId,
              expenseId
            );

          setSplitItems(
            result
          );
        } catch (error) {
          console.error(
            "Expense split error:",
            error
          );

          setSplitError(
            "دریافت تقسیم‌بندی هزینه با خطا مواجه شد."
          );
        } finally {
          setLoadingSplit(
            false
          );
        }
      };

    void loadSplit();
  }, [
    buildingId,
    expenseId,
    expenses,
    setSelectedExpense,
    setSplitItems,
    setLoadingSplit,
    setSplitError,
  ]);

  return (
    <div
      dir="rtl"
      className="space-y-5 px-4 py-5"
    >
      <div className="flex items-center gap-3">
        <Link
          href="/costs"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div>
          <h1 className="text-xl font-bold">
            تقسیم‌بندی هزینه
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {selectedExpense?.name ??
              "هزینه"}
          </p>
        </div>
      </div>

      {selectedExpense && (
        <Card>
          <CardContent className="grid gap-3 p-5 sm:grid-cols-3">

            <div>
              <p className="text-xs text-muted-foreground">
                مبلغ کل
              </p>

              <p className="mt-1 font-bold">
                {formatPrice(
                  selectedExpense.price
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                تاریخ شروع
              </p>

              <p className="mt-1 font-medium">
                {
                  selectedExpense.startdate
                }
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                تاریخ پایان
              </p>

              <p className="mt-1 font-medium">
                {
                  selectedExpense.enddate
                }
              </p>
            </div>

          </CardContent>
        </Card>
      )}

      {splitError && (
        <Card>
          <CardContent className="p-5 text-sm text-destructive">
            {splitError}
          </CardContent>
        </Card>
      )}

      {isLoadingSplit ? (
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      ) : splitItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            اطلاعاتی برای تقسیم‌بندی این هزینه پیدا نشد.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              سهم واحدها
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <div className="divide-y">
              {splitItems.map(
                (item, index) => (
                  <div
                    key={`${item.namev}-${index}`}
                    className="grid gap-3 p-4 sm:grid-cols-4"
                  >
                    <div>
                      <p className="text-xs text-muted-foreground">
                        واحد
                      </p>

                      <p className="mt-1 font-semibold">
                        {item.namev}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        سهم
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatPrice(
                          item.price
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        متراژ
                      </p>

                      <p className="mt-1">
                        {item.metter ||
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        نقش
                      </p>

                      <p className="mt-1">
                        {item.naghsh}
                      </p>
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