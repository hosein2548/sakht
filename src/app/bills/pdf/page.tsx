"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useSearchParams,
} from "next/navigation";

import {
  PDFViewer,
} from "@react-pdf/renderer";

import {
  PDFBillsDocument,
} from "@/src/features/billing/api/pdf.api";

import {
  billingApi,
} from "@/src/features/billing/api/billing.api";

import {
  useBuildingStore,
} from "@/src/features/building/store/building.store";

import {
  useBillingStore,
} from "@/src/features/billing/store/billing.store";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Button,
} from "@/components/ui/button";

import {
  ArrowLeft,
  Download,
  Printer,
} from "lucide-react";

import Link from "next/link";

export default function BillsPDFPage() {
  const searchParams = useSearchParams();

  // دریافت پارامترها از URL
  const mode = searchParams.get("mode") as "sakhteman" | "vahed" | "sandogh" || "sakhteman";
  const buildingId = searchParams.get("buildingId") || "";
  const dateStart = searchParams.get("dateStart") || "";
  const dateEnd = searchParams.get("dateEnd") || "";
  const detailPerson = searchParams.get("detailPerson") || "all";
  const detailCostPay = searchParams.get("detailCostPay") || "all";
  const managerFilter = searchParams.get("managerFilter") || "all";
  const unitFilter = searchParams.get("unitFilter") || "all";
  const selectedUnitId = searchParams.get("selectedUnitId") || "";
  const selectedUnitName = searchParams.get("selectedUnitName") || "";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [buildingBills, setBuildingBills] = useState<any[]>([]);
  const [unitBills, setUnitBills] = useState<any[]>([]);
  const [fundBills, setFundBills] = useState<any[]>([]);

  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const buildingName = selectedBuilding?.names || "ساختمان";

  const loadBill = async () => {
    if (!buildingId) {
      setError("شناسه ساختمان مشخص نیست.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (mode === "sakhteman") {
        let search: any = "sakhteman-all";
        if (managerFilter === "debtor") {
          search = "sakhteman-bedehkar";
        } else if (unitFilter === "one" && selectedUnitId) {
          search = "sakhteman-one";
        }

        const result = await billingApi.getBuilding(
          buildingId,
          selectedUnitId || "",
          search
        );
        setBuildingBills(result);
        setUnitBills([]);
        setFundBills([]);
      } else if (mode === "vahed") {
        const unitId = selectedUnitId || "";
        if (!unitId) {
          setError("شناسه واحد مشخص نیست.");
          setIsLoading(false);
          return;
        }

        let search: any = "vahed-one";
        if (unitFilter === "all") {
          if (detailPerson === "malek") search = "vahed-malek";
          else if (detailPerson === "saken") search = "vahed-saken";
          else search = "vahed-all";
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
          filtered = filtered.filter((item: any) =>
            detailPerson === "malek" ? item.person === "مالک" : item.person === "ساکن"
          );
        }
        if (detailCostPay !== "all") {
          filtered = filtered.filter((item: any) =>
            detailCostPay === "cost" ? item.type === "هزینه" : item.type === "پرداخت"
          );
        }

        setUnitBills(filtered);
        setBuildingBills([]);
        setFundBills([]);
      } else if (mode === "sandogh") {
        const result = await billingApi.getFund(buildingId, dateStart, dateEnd);
        setFundBills(result);
        setBuildingBills([]);
        setUnitBills([]);
      }
    } catch (err) {
      console.error("PDF load error:", err);
      setError("دریافت اطلاعات صورت حساب با خطا مواجه شد.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBill();
  }, [buildingId]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
          <p className="mt-4 text-muted-foreground">در حال آماده‌سازی PDF...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Link href="/bills">
              <Button className="mt-4">بازگشت به صورت حساب</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const hasData =
    buildingBills.length > 0 || unitBills.length > 0 || fundBills.length > 0;

  if (!hasData) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">اطلاعاتی برای نمایش در PDF وجود ندارد.</p>
            <Link href="/bills">
              <Button className="mt-4">بازگشت به صورت حساب</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-background p-4">
        <div className="flex items-center gap-3">
          <Link href="/bills">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-bold">پیش‌نمایش PDF</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="ml-2 h-4 w-4" />
            چاپ
          </Button>
          <Button size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            دانلود PDF
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-100 p-4">
        <PDFViewer width="100%" height="100%" style={{ border: "none", borderRadius: 8 }}>
          <PDFBillsDocument
            mode={mode}
            buildingName={buildingName}
            buildingBills={buildingBills}
            unitBills={unitBills}
            fundBills={fundBills}
            dateStart={dateStart}
            dateEnd={dateEnd}
            detailPerson={detailPerson}
            detailCostPay={detailCostPay}
            managerFilter={managerFilter}
            unitFilter={unitFilter}
            selectedUnitName={selectedUnitName}
          />
        </PDFViewer>
      </div>
    </div>
  );
}