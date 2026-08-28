"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ChevronDown,
} from "lucide-react";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  ruleApi,
} from "@/src/features/rules/api/rule.api";

import {
  useRuleStore,
} from "@/src/features/rules/store/rule.store";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

export default function RulesPage() {
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

  const rules =
    useRuleStore(
      (state) => state.rules
    );

  const isLoading =
    useRuleStore(
      (state) =>
        state.isLoading
    );

  const error =
    useRuleStore(
      (state) => state.error
    );

  const setRules =
    useRuleStore(
      (state) => state.setRules
    );

  const setLoading =
    useRuleStore(
      (state) =>
        state.setLoading
    );

  const setError =
    useRuleStore(
      (state) => state.setError
    );

  const [
    openedIndex,
    setOpenedIndex,
  ] = useState<number | null>(
    null
  );

  const buildingId =
    selectedBuilding?.ids ??
    selectedUnit?.ids ??
    "";

  const loadRules =
    async () => {
      if (!buildingId) {
        return;
      }

      try {
        setLoading(true);

        setError(null);

        const result =
          await ruleApi.getAll(
            buildingId
          );

        setRules(result);
      } catch (requestError) {
        console.error(
          "Rules loading error:",
          requestError
        );

        setError(
          "دریافت قوانین ساختمان با خطا مواجه شد."
        );
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    void loadRules();

    // فقط هنگام تغییر ساختمان دریافت شود.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId]);

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
            قوانین ساختمان
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {selectedBuilding?.names ??
              selectedUnit?.names ??
              "ساختمان"}
          </p>
        </div>
      </div>

      {/* بدون ساختمان */}

      {!buildingId && (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            ابتدا یک ساختمان را انتخاب کنید.
          </CardContent>
        </Card>
      )}

      {/* خطا */}

      {error && (
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />

            <p className="flex-1 text-sm text-destructive">
              {error}
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                void loadRules();
              }}
            >
              تلاش مجدد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}

      {buildingId &&
        isLoading && (
          <Card>
            <CardContent className="flex min-h-48 items-center justify-center">
              <div className="text-center">

                <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />

                <p className="text-sm text-muted-foreground">
                  در حال دریافت قوانین...
                </p>

              </div>
            </CardContent>
          </Card>
        )}

      {/* قوانین پیدا نشد */}

      {buildingId &&
        !isLoading &&
        !error &&
        rules.length === 0 && (
          <Card>
            <CardContent className="flex min-h-48 flex-col items-center justify-center p-8 text-center">

              <BookOpen className="mb-4 h-10 w-10 text-muted-foreground" />

              <p className="font-semibold">
                قوانین بارگذاری نشده است
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                برای این ساختمان قانونی ثبت نشده است.
              </p>

            </CardContent>
          </Card>
        )}

      {/* لیست قوانین */}

      {!isLoading &&
        rules.length > 0 && (
          <div className="space-y-3">

            {rules.map(
              (rule, index) => {
                const opened =
                  openedIndex ===
                  index;

                return (
                  <Card
                    key={`${rule.subject}-${index}`}
                  >
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 p-4 text-right"
                      onClick={() =>
                        setOpenedIndex(
                          opened
                            ? null
                            : index
                        )
                      }
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <BookOpen className="h-5 w-5" />
                      </div>

                      <span className="flex-1 font-semibold">
                        {rule.subject ||
                          "قانون ساختمان"}
                      </span>

                      <ChevronDown
                        className={[
                          "h-5 w-5 shrink-0 transition-transform",
                          opened
                            ? "rotate-180"
                            : "",
                        ].join(" ")}
                      />
                    </button>

                    {opened && (
                      <CardContent className="border-t px-4 py-5">
                        <div className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                          {rule.text ||
                            "متنی برای این قانون ثبت نشده است."}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              }
            )}

          </div>
        )}
    </div>
  );
}