"use client";
import { useRouter } from "next/navigation";

import {
  useEffect,
  useState,
  useCallback,
} from "react";

import Link from "next/link";



import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarDays,
  Wallet,
  FileText,
} from "lucide-react";

import {
  useAppStore,
} from "@/src/core/store/app.store";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  billingApi,
  type BillingMode,
} from "@/src/features/billing/api/billing.api";

import {
  useBillingStore,
} from "@/src/features/billing/store/billing.store";

import {
  unitApi,
} from "@/src/features/units/api/unit.api";

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
  Label,
} from "@/components/ui/label";

import {
  Input,
} from "@/components/ui/input";

// ============================================
// Helper Functions
// ============================================

function parsePrice(value: string): number {
  return Number(value.replace(/,/g, "")) || 0;
}

function formatPrice(value: string): string {
  const num = Number(value.replace(/,/g, ""));
  if (isNaN(num)) return "۰";
  return new Intl.NumberFormat("en-US").format(num);
}

// ============================================
// Component
// ============================================

export default function BillsPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);

  // Store actions - جدا گرفته شدن برای جلوگیری از خطای React Compiler
  const buildingBills = useBillingStore((state) => state.buildingBills);
  const unitBills = useBillingStore((state) => state.unitBills);
  const fundBills = useBillingStore((state) => state.fundBills);
  const isLoading = useBillingStore((state) => state.isLoading);
  const error = useBillingStore((state) => state.error);

  const setBuildingBills = useBillingStore((state) => state.setBuildingBills);
  const setUnitBills = useBillingStore((state) => state.setUnitBills);
  const setFundBills = useBillingStore((state) => state.setFundBills);
  const setLoading = useBillingStore((state) => state.setLoading);
  const setError = useBillingStore((state) => state.setError);

  // ============================================
  // State
  // ============================================

  const [mode, setMode] = useState<BillingMode>(
    selectedBuilding ? "sakhteman" : "vahed"
  );

  const [managerFilter, setManagerFilter] = useState<"all" | "debtor">("all");
  const [unitFilter, setUnitFilter] = useState<"all" | "one">(
    selectedBuilding ? "all" : "one"
  );

  const [detailPerson, setDetailPerson] = useState<"all" | "malek" | "saken">("all");
  const [detailCostPay, setDetailCostPay] = useState<"all" | "cost" | "pay">("all");

  const [units, setUnits] = useState<UnitSummary[]>([]);
  // استفاده از selectedUnit?.idv به عنوان مقدار اولیه
  const [selectedUnitId, setSelectedUnitId] = useState(selectedUnit?.idv ?? "");

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const buildingId = selectedBuilding?.ids ?? selectedUnit?.ids ?? "";
  const isManager = Boolean(
    user?.iduser && selectedBuilding?.idmodir === user.iduser
  );

  // ============================================
  // Load Units
  // ============================================

  useEffect(() => {
    if (!buildingId || !isManager) return;

    const loadUnits = async () => {
      try {
        const result = await unitApi.getAll(buildingId);
        setUnits(result);
        if (result.length > 0 && !selectedUnitId) {
          setSelectedUnitId(result[0].idv);
        }
      } catch (requestError) {
        console.error("Bill units error:", requestError);
      }
    };

    void loadUnits();
  }, [buildingId, isManager, selectedUnitId]);

  // ============================================
  // Load Bill - با useCallback و dependencies صحیح
  // ============================================

  const loadBill = useCallback(async () => {
    if (!buildingId) return;

    try {
      setLoading(true);
      setError(null);

      // ============================================
      // حالت تجمیعی (ساختمان)
      // ============================================
      if (mode === "sakhteman") {
        let search: "sakhteman-one" | "sakhteman-all" | "sakhteman-bedehkar" = "sakhteman-all";

        if (!isManager) {
          search = "sakhteman-one";
        } else if (managerFilter === "debtor") {
          search = "sakhteman-bedehkar";
        } else if (unitFilter === "one" && selectedUnitId) {
          search = "sakhteman-one";
        } else {
          search = "sakhteman-all";
        }

        let unitId = "";
        if (!isManager) {
          unitId = selectedUnitId;
        } else if (unitFilter === "one" && selectedUnitId) {
          unitId = selectedUnitId;
        }

        console.log("🔍 Bill search:", { search, unitId, isManager, unitFilter, selectedUnitId });

        const result = await billingApi.getBuilding(buildingId, unitId, search);
        setBuildingBills(result);
        setUnitBills([]);
        setFundBills([]);
        return;
      }

      // ============================================
      // حالت جزئیات (واحد)
      // ============================================
      if (mode === "vahed") {
        const unitId = isManager ? selectedUnitId : selectedUnitId;

        if (!unitId) {
          setError("واحد موردنظر مشخص نیست.");
          return;
        }

        let search: "vahed-one" | "vahed-all" | "vahed-malek" | "vahed-saken" = "vahed-one";

        if (isManager && unitFilter === "all") {
          if (detailPerson === "malek") {
            search = "vahed-malek";
          } else if (detailPerson === "saken") {
            search = "vahed-saken";
          } else {
            search = "vahed-all";
          }
        }

        const result = await billingApi.getUnit(
          buildingId,
          unitId,
          search,
          dateStart,
          dateEnd
        );

        let filtered = result;

        if (detailPerson !== "all") {
          filtered = filtered.filter((item) =>
            detailPerson === "malek" ? item.person === "مالک" : item.person === "ساکن"
          );
        }

        if (detailCostPay !== "all") {
          filtered = filtered.filter((item) =>
            detailCostPay === "cost" ? item.type === "هزینه" : item.type === "پرداخت"
          );
        }

        setUnitBills(filtered);
        setBuildingBills([]);
        setFundBills([]);
        return;
      }

      // ============================================
      // حالت صندوق
      // ============================================
      const result = await billingApi.getFund(buildingId, dateStart, dateEnd);
      setFundBills(result);
      setBuildingBills([]);
      setUnitBills([]);

    } catch (requestError) {
      console.error("Billing error:", requestError);
      setError("دریافت صورت‌حساب با خطا مواجه شد.");
    } finally {
      setLoading(false);
    }
  }, [
    buildingId,
    mode,
    isManager,
    managerFilter,
    unitFilter,
    selectedUnitId,
    detailPerson,
    detailCostPay,
    dateStart,
    dateEnd,
    // توابع setter رو از dependencies حذف کردیم چون از Zustand میان و پایدار هستن
  ]);

  // ============================================
  // Effects
  // ============================================

  // بارگذاری اولیه
  useEffect(() => {
    if (!buildingId) return;
    void loadBill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId, mode]);

  // بارگذاری مجدد هنگام تغییر فیلترها
  useEffect(() => {
    if (!buildingId) return;

    let hasActiveFilter = false;

    if (mode === "sakhteman") {
      const isDebtorFilter = managerFilter === "debtor";
      const isUnitSelected = unitFilter === "one" && selectedUnitId !== "";
      hasActiveFilter = isDebtorFilter || isUnitSelected;
    }

    if (mode === "vahed") {
      const hasDateFilter = dateStart !== "" || dateEnd !== "";
      const hasPersonFilter = detailPerson !== "all";
      const hasCostPayFilter = detailCostPay !== "all";
      const hasUnitSelected = unitFilter === "one" && selectedUnitId !== "";
      hasActiveFilter = hasDateFilter || hasPersonFilter || hasCostPayFilter || hasUnitSelected;
    }

    if (mode === "sandogh") {
      hasActiveFilter = dateStart !== "" || dateEnd !== "";
    }

    if (hasActiveFilter) {
      void loadBill();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    managerFilter,
    unitFilter,
    selectedUnitId,
    detailPerson,
    detailCostPay,
    dateStart,
    dateEnd,
  ]);

  // ============================================
  // Handlers
  // ============================================

  const handleApplyFilters = () => {
    void loadBill();
  };

  const handleGeneratePDF = () => {
  // ساخت پارامترهای URL برای صفحه PDF
  const params = new URLSearchParams();
  params.set("mode", mode);
  params.set("buildingId", buildingId);
  params.set("dateStart", dateStart);
  params.set("dateEnd", dateEnd);
  params.set("detailPerson", detailPerson);
  params.set("detailCostPay", detailCostPay);
  params.set("managerFilter", managerFilter);
  params.set("unitFilter", unitFilter);
  params.set("selectedUnitId", selectedUnitId);
  
  // پیدا کردن نام واحد انتخاب شده
  const selectedUnit = units.find((u) => u.idv === selectedUnitId);
  if (selectedUnit) {
    params.set("selectedUnitName", selectedUnit.namev);
  }

  // هدایت به صفحه PDF
  router.push(`/bills/pdf?${params.toString()}`);
};

  // ============================================
  // Render Helpers
  // ============================================

  const hasData =
    buildingBills.length > 0 || unitBills.length > 0 || fundBills.length > 0;

  const hasAnyFilter =
    mode === "sakhteman"
      ? managerFilter !== "all" || (unitFilter === "one" && selectedUnitId)
      : mode === "vahed"
      ? dateStart !== "" ||
        dateEnd !== "" ||
        detailPerson !== "all" ||
        detailCostPay !== "all" ||
        (unitFilter === "one" && selectedUnitId)
      : dateStart !== "" || dateEnd !== "";

  // ============================================
  // Render
  // ============================================

  return (
    <div dir="rtl" className="space-y-5 px-4 py-5">
      {/* ============================================
          Header
          ============================================ */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">صورت حساب</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {selectedBuilding?.names ?? selectedUnit?.names ?? "ساختمان"}
          </p>
        </div>

        {hasData && (
          <Button
            onClick={handleGeneratePDF}
            className="gap-2 bg-destructive hover:bg-destructive/90 text-white"
          >
            <FileText className="h-4 w-4" />
            PDF
          </Button>
        )}
      </div>

      {!buildingId && (
        <Card>
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            ابتدا یک ساختمان یا واحد را انتخاب کنید.
          </CardContent>
        </Card>
      )}

      {buildingId && (
        <>
          {/* ============================================
              انتخاب نوع گزارش
              ============================================ */}
          <Card>
            <CardHeader>
              <CardTitle>نوع گزارش</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <Choice
                active={mode === "sakhteman"}
                title="تجمیعی"
                onClick={() => setMode("sakhteman")}
              />
              <Choice
                active={mode === "vahed"}
                title="با جزئیات"
                onClick={() => setMode("vahed")}
              />
              <Choice
                active={mode === "sandogh"}
                title="صندوق"
                onClick={() => setMode("sandogh")}
              />
            </CardContent>
          </Card>

          {/* ============================================
              فیلتر تجمیعی (فقط برای مدیر)
              ============================================ */}
          {mode === "sakhteman" && isManager && (
            <Card>
              <CardContent className="space-y-4 p-4">
                {/* فیلتر نمایش */}
                <div className="space-y-2">
                  <Label>نمایش</Label>
                  <div className="flex gap-3">
                    <FilterButton
                      active={managerFilter === "all"}
                      onClick={() => setManagerFilter("all")}
                      label="همه"
                    />
                    <FilterButton
                      active={managerFilter === "debtor"}
                      onClick={() => setManagerFilter("debtor")}
                      label="بدهکاران"
                    />
                  </div>
                </div>

                {/* انتخاب واحد */}
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>واحد</Label>
                    <div className="flex gap-3">
                      <FilterButton
                        active={unitFilter === "all"}
                        onClick={() => {
                          setUnitFilter("all");
                          setSelectedUnitId("");
                        }}
                        label="همه واحدها"
                      />
                      <FilterButton
                        active={unitFilter === "one"}
                        onClick={() => {
                          setUnitFilter("one");
                          if (units.length > 0 && !selectedUnitId) {
                            setSelectedUnitId(units[0].idv);
                          }
                        }}
                        label="یک واحد"
                      />
                    </div>
                  </div>

                  {unitFilter === "one" && (
                    <div className="space-y-2">
                      <Label>انتخاب واحد</Label>
                      <select
                        value={selectedUnitId}
                        onChange={(e) => setSelectedUnitId(e.target.value)}
                        className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      >
                        {units.length === 0 ? (
                          <option value="">واحدی یافت نشد</option>
                        ) : (
                          units.map((unit) => (
                            <option key={unit.idv} value={unit.idv}>
                              {unit.namev}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  )}
                </div>

                {hasAnyFilter && (
                  <Button onClick={handleApplyFilters} className="w-full">
                    اعمال فیلتر
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* ============================================
              فیلتر جزئیات (برای همه کاربران)
              ============================================ */}
          {mode === "vahed" && (
            <Card>
              <CardContent className="space-y-4 p-4">
                {/* انتخاب واحد - فقط برای مدیر */}
                {isManager && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>واحد</Label>
                      <div className="flex gap-3">
                        <FilterButton
                          active={unitFilter === "one"}
                          onClick={() => {
                            setUnitFilter("one");
                            if (units.length > 0 && !selectedUnitId) {
                              setSelectedUnitId(units[0].idv);
                            }
                          }}
                          label="یک واحد"
                        />
                        <FilterButton
                          active={unitFilter === "all"}
                          onClick={() => setUnitFilter("all")}
                          label="همه واحدها"
                        />
                      </div>
                    </div>

                    {unitFilter === "one" && (
                      <div className="space-y-2">
                        <Label>انتخاب واحد</Label>
                        <select
                          value={selectedUnitId}
                          onChange={(e) => setSelectedUnitId(e.target.value)}
                          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                        >
                          {units.length === 0 ? (
                            <option value="">واحدی یافت نشد</option>
                          ) : (
                            units.map((unit) => (
                              <option key={unit.idv} value={unit.idv}>
                                {unit.namev}
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* فیلتر تاریخ */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>از تاریخ</Label>
                    <Input
                      dir="ltr"
                      maxLength={10}
                      placeholder="1404/01/01"
                      value={dateStart}
                      onChange={(e) => setDateStart(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>تا تاریخ</Label>
                    <Input
                      dir="ltr"
                      maxLength={10}
                      placeholder="1404/01/31"
                      value={dateEnd}
                      onChange={(e) => setDateEnd(e.target.value)}
                    />
                  </div>
                </div>

                {/* فیلتر شخص */}
                <div className="space-y-2">
                  <Label>شخص</Label>
                  <div className="flex gap-2">
                    <FilterButton
                      active={detailPerson === "all"}
                      onClick={() => setDetailPerson("all")}
                      label="همه"
                    />
                    <FilterButton
                      active={detailPerson === "malek"}
                      onClick={() => setDetailPerson("malek")}
                      label="مالک"
                    />
                    <FilterButton
                      active={detailPerson === "saken"}
                      onClick={() => setDetailPerson("saken")}
                      label="ساکن"
                    />
                  </div>
                </div>

                {/* فیلتر نوع */}
                <div className="space-y-2">
                  <Label>نوع</Label>
                  <div className="flex gap-2">
                    <FilterButton
                      active={detailCostPay === "all"}
                      onClick={() => setDetailCostPay("all")}
                      label="همه موراد"
                    />
                    <FilterButton
                      active={detailCostPay === "cost"}
                      onClick={() => setDetailCostPay("cost")}
                      label="هزینه‌ها"
                    />
                    <FilterButton
                      active={detailCostPay === "pay"}
                      onClick={() => setDetailCostPay("pay")}
                      label="پرداختی‌ها"
                    />
                  </div>
                </div>

                {hasAnyFilter && (
                  <Button onClick={handleApplyFilters} className="w-full">
                    اعمال فیلتر
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* ============================================
              فیلتر صندوق
              ============================================ */}
          {mode === "sandogh" && (
            <Card>
              <CardContent className="grid gap-4 p-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>از تاریخ</Label>
                  <Input
                    dir="ltr"
                    maxLength={10}
                    placeholder="1404/01/01"
                    value={dateStart}
                    onChange={(e) => setDateStart(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>تا تاریخ</Label>
                  <Input
                    dir="ltr"
                    maxLength={10}
                    placeholder="1404/01/31"
                    value={dateEnd}
                    onChange={(e) => setDateEnd(e.target.value)}
                  />
                </div>
                {hasAnyFilter && (
                  <Button onClick={handleApplyFilters} className="sm:col-span-2">
                    <CalendarDays className="ml-2 h-4 w-4" />
                    اعمال تاریخ
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* ============================================
              Loading
              ============================================ */}
          {isLoading && (
            <Card>
              <CardContent className="flex min-h-40 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </CardContent>
            </Card>
          )}

          {/* ============================================
              Error
              ============================================ */}
          {error && (
            <Card>
              <CardContent className="flex items-center gap-3 p-5 text-sm text-destructive">
                <AlertTriangle className="h-5 w-5" />
                {error}
                <Button variant="outline" size="sm" onClick={handleApplyFilters}>
                  تلاش مجدد
                </Button>
              </CardContent>
            </Card>
          )}

          {/* ============================================
              نمایش نتایج - تجمیعی
              ============================================ */}
          {!isLoading && mode === "sakhteman" && buildingBills.length > 0 && (
            <div className="space-y-3">
              {buildingBills.map((bill) => (
                <Card key={bill.unitId}>
                  <CardContent className="space-y-4 p-4">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5" />
                      <h2 className="font-bold">واحد {bill.unitName}</h2>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <SummaryRow label="جمع پرداختی مالک" value={bill.sumPayOwner} />
                      <SummaryRow label="جمع هزینه مالک" value={bill.sumCostOwner} />
                      <SummaryRow label="جمع پرداختی ساکن" value={bill.sumPayResident} />
                      <SummaryRow label="جمع هزینه ساکن" value={bill.sumCostResident} />
                      <SummaryRow
                        label="وضعیت مالک"
                        value={`${bill.balanceOwner} ${bill.ownerStatus}`}
                        status={bill.ownerStatus}
                      />
                      <SummaryRow
                        label="وضعیت ساکن"
                        value={`${bill.balanceResident} ${bill.residentStatus}`}
                        status={bill.residentStatus}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ============================================
              نمایش نتایج - جزئیات با جمع‌ها
              ============================================ */}
          {!isLoading && mode === "vahed" && unitBills.length > 0 && (
            <>
             

              {/* لیست جزئیات */}
              <Card>
                <CardHeader>
                  <CardTitle>جزئیات صورت حساب</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {unitBills.map((item, index) => (
                      <div key={`${item.unitId}-${item.title}-${index}`} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-semibold">{item.title}</p>
                            <p className="mt-1 text-sm text-muted-foreground">
                              واحد: {item.unitName}
                            </p>
                          </div>
                          <p className="font-bold">{item.price}</p>
                        </div>
                        <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                          <span>نوع: {item.type}</span>
                          <span>پرداخت‌کننده: {item.person}</span>
                          <span>تاریخ: {item.dateFrom}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* ============================================
              نمایش نتایج - صندوق
              ============================================ */}
          {!isLoading && mode === "sandogh" && fundBills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  گردش صندوق
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {fundBills.map((item, index) => (
                    <div key={`${item.title}-${index}`} className="flex items-start justify-between gap-4 p-4">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {item.dateStart} تا {item.dateEnd}
                        </p>
                      </div>
                      <p className="font-bold">{item.price}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ============================================
              Empty State
              ============================================ */}
          {!isLoading && !error && !hasData && (
            <Card>
              <CardContent className="p-8 text-center text-sm text-muted-foreground">
                اطلاعاتی تا این لحظه ثبت نشده است.
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// Sub-Components
// ============================================

function Choice({
  active,
  title,
  onClick,
}: {
  active: boolean;
  title: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-xl border p-4 text-center font-medium transition",
        active ? "border-primary bg-primary/10" : "hover:bg-muted",
      ].join(" ")}
    >
      {title}
    </button>
  );
}

function FilterButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition",
        active ? "border-primary bg-primary/10" : "hover:bg-muted",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function SummaryRow({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status?: string;
}) {
  const getStatusColor = () => {
    if (status === "بدهکار") return "text-destructive";
    if (status === "بستانکار") return "text-success";
    return "text-muted-foreground";
  };

  return (
    <div className="rounded-xl border p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-bold">{value}</p>
      {status && (
        <p className={["mt-1 text-xs font-semibold", getStatusColor()].join(" ")}>
          {status}
        </p>
      )}
    </div>
  );
}