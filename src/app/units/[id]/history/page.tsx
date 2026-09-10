// src/app/units/[id]/history/page.tsx
"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Users,
  Clock,
  Trash2,
  RefreshCw,
} from "lucide-react";

import { unitHistoryApi } from "@/src/features/units/api/unit-history.api";
import { useBuildingStore } from "@/src/features/building/store/building.store";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

// ============================================
// Types
// ============================================

interface ResidentHistory {
  idvahed: string;
  idnaghsh: string;
  startDate: string;
  endDate: string;
  count: string;
  status: "active" | "ended" | "pending";
}

// ============================================
// Component با Suspense
// ============================================

function HistoryContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const unitId = params?.id as string;
  const userId = searchParams?.get("userId") || "";

  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);

  const [history, setHistory] = useState<ResidentHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [endDate, setEndDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const getTodayPersian = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear() - 621;
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}/${month}/${day}`;
  }, []);

  const loadHistory = useCallback(async () => {
    console.log("🔍 Loading history for:", { unitId, userId });

    if (!unitId) {
      setError("شناسه واحد موجود نیست.");
      setIsLoading(false);
      return;
    }

    if (!userId) {
      setError("شناسه کاربر مشخص نیست.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await unitHistoryApi.getHistory({
        unitId,
        userId,
      });

      console.log("✅ History result:", result);
      setHistory(result);
    } catch (err) {
      console.error("❌ Load history error:", err);
      setError("دریافت سوابق با خطا مواجه شد.");
    } finally {
      setIsLoading(false);
    }
  }, [unitId, userId]);

  useEffect(() => {
    if (unitId && userId) {
      void loadHistory();
    } else {
      setIsLoading(false);
      if (!userId) {
        setError("شناسه کاربر مشخص نیست. لطفاً از صفحه واحد وارد شوید.");
      }
    }
  }, [unitId, userId, loadHistory]);

  const handleEndHistory = async () => {
    if (!selectedHistoryId) return;

    if (!endDate || endDate.length !== 10) {
      setDeleteError("تاریخ را به صورت صحیح وارد کنید (مثال: 1404/01/15)");
      return;
    }

    setIsDeleting(true);
    setDeleteError("");

    try {
      const result = await unitHistoryApi.endHistory({
        idnaghsh: selectedHistoryId,
        endDate: endDate,
      });

      if (result.success) {
        setHistory((prev) => prev.filter((item) => item.idnaghsh !== selectedHistoryId));
        setIsDialogOpen(false);
        setSelectedHistoryId(null);
        setEndDate("");
      } else {
        setDeleteError(result.message || "خطا در پایان سکونت.");
      }
    } catch (err) {
      console.error("❌ End history error:", err);
      setDeleteError("ارتباط با سرور برقرار نشد.");
    } finally {
      setIsDeleting(false);
    }
  };

  const openEndDialog = (idnaghsh: string) => {
    setSelectedHistoryId(idnaghsh);
    setEndDate(getTodayPersian());
    setDeleteError("");
    setIsDialogOpen(true);
  };

  const formatDate = (date: string) => {
    if (!date || date === "1490/01/01") return "تا کنون";
    return date;
  };

  const getStatusBadge = (status: string) => {
    if (status === "active" ) {
      return (
        <Badge className="bg-success/100 hover:bg-success/90 text-white">فعال</Badge>
      );
    }
    else return <Badge variant="secondary">پایان یافته</Badge>;
  };

  return (
    <div dir="rtl" className="space-y-5 px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href={`/units/${unitId}`}
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">سوابق سکونت</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {selectedUnit?.namev || selectedBuilding?.names || "واحد"}
          </p>
          {userId && <p className="text-xs text-muted-foreground">شناسه کاربر: {userId}</p>}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => void loadHistory()}
          disabled={isLoading}
          title="بارگذاری مجدد"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      {/* Error */}
      {error && (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="mr-auto"
            onClick={() => void loadHistory()}
          >
            تلاش مجدد
          </Button>
        </Alert>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && history.length === 0 && (
        <Card>
          <CardContent className="flex min-h-48 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">سوابقی یافت نشد</h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              این شخص تاکنون سابقه سکونتی در این واحد ندارد.
            </p>
            <Button
              variant="outline"
              className="mt-4 gap-2"
              onClick={() => void loadHistory()}
            >
              <RefreshCw className="h-4 w-4" />
              بارگذاری مجدد
            </Button>
          </CardContent>
        </Card>
      )}

      {/* History List */}
      {!isLoading && history.length > 0 && (
        <div className="space-y-3">
          {history.map((item) => (
            <Card key={item.idnaghsh} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">دوره سکونت</span>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>از {formatDate(item.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        <span>تا {formatDate(item.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{item.count} نفر</span>
                      </div>
                    </div>
                  </div>

                  {item.status === "active" && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => openEndDialog(item.idnaghsh)}
                      title="پایان سکونت"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* End History Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>پایان سکونت</DialogTitle>
            <DialogDescription>
              آیا از پایان دوره سکونت این فرد اطمینان دارید؟
              <br />
              تاریخ پایان را وارد کنید.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">تاریخ پایان سکونت (شمسی)</Label>
              <Input
                id="endDate"
                dir="ltr"
                placeholder="مثال: 1404/01/15"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDeleteError("");
                }}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                فرمت: سال/ماه/روز (مثال: 1404/01/15)
              </p>
              {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedHistoryId(null);
                setEndDate("");
                setDeleteError("");
              }}
              disabled={isDeleting}
            >
              انصراف
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleEndHistory()}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  در حال پردازش...
                </>
              ) : (
                "پایان سکونت"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================
// صفحه اصلی با Suspense
// ============================================

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function UnitHistoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mr-4 text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      }
    >
      <HistoryContent />
    </Suspense>
  );
}