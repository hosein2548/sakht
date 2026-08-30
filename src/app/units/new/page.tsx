// src/app/units/new/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Save, Home, Ruler, ParkingSquare, Warehouse, Zap, Droplets, Flame, FileText, Calendar, X, Check, AlertCircle } from "lucide-react";

import { useAppStore } from "@/src/core/store/app.store";
import { useBuildingStore } from "@/src/features/building/store/building.store";
import { unitApi } from "@/src/features/units/api/unit.api";
import { useSession } from "@/src/providers";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";

// ============================================
// Helper
// ============================================

function getTodayPersian(): string {
  const now = new Date();
  const year = now.getFullYear() - 621;
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}/${month}/${day}`;
}

function isValidPersianDate(date: string): boolean {
  const pattern = /^(\d{4})\/(\d{2})\/(\d{2})$/;
  if (!pattern.test(date)) return false;

  const [, year, month, day] = date.match(pattern) || [];
  const y = parseInt(year);
  const m = parseInt(month);
  const d = parseInt(day);

  if (y < 1300 || y > 1500) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;

  const daysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
  if (d > daysInMonth[m - 1]) return false;

  return true;
}

// ============================================
// Component
// ============================================

export default function NewUnitPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);
  const { isAuthenticated, isLoading: sessionLoading } = useSession();

  // ============================================
  // State - Form
  // ============================================

  const [namevahed, setNamevahed] = useState("");
  const [metter, setMetter] = useState("");
  const [parking, setParking] = useState("");
  const [anbari, setAnbari] = useState("");
  const [bargh, setBargh] = useState("");
  const [aab, setAab] = useState("");
  const [gaz, setGaz] = useState("");
  const [tozihat, setTozihat] = useState("");
  const [datefrom, setDatefrom] = useState(getTodayPersian());

  // ============================================
  // State - Submit
  // ============================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================
  // Auth Check
  // ============================================

  useEffect(() => {
    if (sessionLoading) return;
    if (!isAuthenticated || !user) {
      router.replace("/login");
    }
  }, [sessionLoading, isAuthenticated, user, router]);

  // ============================================
  // مدیریت کننده‌ها
  // ============================================

  const validateForm = (): boolean => {
    if (!namevahed.trim()) {
      setError("نام واحد را وارد کنید.");
      return false;
    }

    if (!metter.trim() || parseInt(metter) <= 0) {
      setError("متراژ واحد را به درستی وارد کنید.");
      return false;
    }

    if (!datefrom || datefrom.length !== 10) {
      setError("تاریخ شروع را به صورت صحیح وارد کنید.");
      return false;
    }

    if (!isValidPersianDate(datefrom)) {
      setError("تاریخ وارد شده معتبر نیست. فرمت صحیح: 1404/01/01");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const buildingId = selectedBuilding?.ids ?? selectedUnit?.ids ?? "";
    if (!buildingId) {
      setError("شناسه ساختمان مشخص نیست.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await unitApi.create({
        ids: buildingId,
        namevahed: namevahed.trim(),
        metter: metter.trim(),
        aab: aab.trim() || "0",
        gaz: gaz.trim() || "0",
        bargh: bargh.trim() || "0",
        parking: parking.trim() || "0",
        anbari: anbari.trim() || "0",
        tozihat: tozihat.trim() || "0",
        datefrom: datefrom.trim(),
      });

      if (!result.success) {
        setError(result.message || "ایجاد واحد انجام نشد.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        router.push("/units");
      }, 1500);
    } catch (err) {
      console.error("Create unit error:", err);
      setError("ایجاد واحد با خطا مواجه شد.");
      setIsSubmitting(false);
    }
  };

  // ============================================
  // Loading States
  // ============================================

  if (sessionLoading) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">در حال بارگذاری...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const buildingName = selectedBuilding?.names ?? selectedUnit?.names ?? "";

  // ============================================
  // Success State
  // ============================================

  if (success) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold">واحد با موفقیت ایجاد شد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              واحد جدید با موفقیت در سیستم ثبت شد.
            </p>
            <Button className="mt-6" onClick={() => router.push("/units")}>
              رفتن به لیست واحدها
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // Render Form
  // ============================================

  return (
    <div dir="rtl" className="space-y-5 px-4 py-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/units"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">ایجاد واحد جدید</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {buildingName || "ساختمان"}
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              مشخصات واحد
            </CardTitle>
            <CardDescription>
              اطلاعات واحد جدید را وارد کنید.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* ============================================
                نام واحد
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="unit-name">
                نام واحد <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit-name"
                placeholder="مثال: ۱۰۱"
                value={namevahed}
                onChange={(e) => {
                  setNamevahed(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                maxLength={15}
              />
              <p className="text-xs text-muted-foreground">
                حداکثر ۱۵ کاراکتر
              </p>
            </div>

            {/* ============================================
                متراژ
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="unit-metter">
                متراژ (متر مربع) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit-metter"
                type="number"
                min="1"
                placeholder="مثال: ۱۰۰"
                value={metter}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setMetter(value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                maxLength={4}
              />
            </div>

            {/* ============================================
                پارکینگ و انباری
                ============================================ */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="unit-parking" className="flex items-center gap-1">
                  <ParkingSquare className="h-4 w-4" />
                  شماره پارکینگ
                </Label>
                <Input
                  id="unit-parking"
                  placeholder="مثال: ۵"
                  value={parking}
                  onChange={(e) => {
                    setParking(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  maxLength={15}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-anbari" className="flex items-center gap-1">
                  <Warehouse className="h-4 w-4" />
                  شماره انباری
                </Label>
                <Input
                  id="unit-anbari"
                  placeholder="مثال: ۳"
                  value={anbari}
                  onChange={(e) => {
                    setAnbari(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  maxLength={15}
                />
              </div>
            </div>

            {/* ============================================
                شناسه‌های آب، برق، گاز
                ============================================ */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="unit-bargh" className="flex items-center gap-1">
                  <Zap className="h-4 w-4" />
                  شناسه برق
                </Label>
                <Input
                  id="unit-bargh"
                  placeholder="شناسه برق"
                  value={bargh}
                  onChange={(e) => {
                    setBargh(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-aab" className="flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  شناسه آب
                </Label>
                <Input
                  id="unit-aab"
                  placeholder="شناسه آب"
                  value={aab}
                  onChange={(e) => {
                    setAab(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit-gaz" className="flex items-center gap-1">
                  <Flame className="h-4 w-4" />
                  شناسه گاز
                </Label>
                <Input
                  id="unit-gaz"
                  placeholder="شناسه گاز"
                  value={gaz}
                  onChange={(e) => {
                    setGaz(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isSubmitting}
                  maxLength={20}
                />
              </div>
            </div>

            {/* ============================================
                تاریخ شروع
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="unit-date">
                تاریخ شروع <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unit-date"
                dir="ltr"
                placeholder="مثال: 1404/01/01"
                value={datefrom}
                onChange={(e) => {
                  setDatefrom(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                maxLength={10}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                فرمت: سال/ماه/روز (مثال: 1404/01/01)
              </p>
            </div>

            {/* ============================================
                توضیحات
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="unit-tozihat" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                توضیحات
              </Label>
              <Textarea
                id="unit-tozihat"
                placeholder="توضیحات تکمیلی..."
                value={tozihat}
                onChange={(e) => {
                  setTozihat(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                maxLength={100}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                حداکثر ۱۰۰ کاراکتر
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ============================================
            Actions
            ============================================ */}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/units")}
            disabled={isSubmitting}
          >
            انصراف
          </Button>

          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                در حال ایجاد...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                ایجاد واحد
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}