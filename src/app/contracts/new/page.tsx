// src/app/contracts/new/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Save,
  X,
  Upload,
  Trash2,
  Calendar,
  Phone,
  MapPin,
  User,
  FileText,
  DollarSign,
  Building2,
} from "lucide-react";

import { useAppStore } from "@/src/core/store/app.store";
import { useBuildingStore } from "@/src/features/building/store/building.store";
import { contractApi } from "@/src/features/contracts/api/contract.api";
import { unitApi } from "@/src/features/units/api/unit.api";

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

import type { UnitSummary } from "@/src/features/units/types/unit.types";

// ============================================
// Types
// ============================================

type FormState = "idle" | "loading" | "success" | "error";

// ============================================
// Component
// ============================================

export default function NewContractPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const selectedBuilding = useBuildingStore((state) => state.selectedBuilding);
  const selectedUnit = useBuildingStore((state) => state.selectedUnit);

  // ============================================
  // State
  // ============================================

  const [units, setUnits] = useState<UnitSummary[]>([]);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);

  // فرم
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [subject, setSubject] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [receipt, setReceipt] = useState<File | null>(null);

  const [formState, setFormState] = useState<FormState>("idle");
  const [error, setError] = useState<string | null>(null);

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
        setIsLoadingUnits(true);
        const result = await unitApi.getAll(buildingId);
        setUnits(result);
        if (result.length > 0 && !selectedUnitId) {
          setSelectedUnitId(result[0].idv);
        }
      } catch (err) {
        console.error("Load units error:", err);
        setError("دریافت لیست واحدها با خطا مواجه شد.");
      } finally {
        setIsLoadingUnits(false);
      }
    };

    void loadUnits();
  }, [buildingId, isManager]);

  // ============================================
  // Handlers
  // ============================================

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      // بررسی نوع فایل (تصویر یا PDF)
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!validTypes.includes(file.type)) {
        setError("فایل باید تصویر (JPG, PNG) یا PDF باشد.");
        return;
      }
      // بررسی حجم (حداکثر 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم فایل نباید بیشتر از 5 مگابایت باشد.");
        return;
      }
      setReceipt(file);
      setError(null);
    }
  };

  const removeFile = () => {
    setReceipt(null);
  };

  const formatPrice = (value: string) => {
    const numeric = value.replace(/\D/g, "");
    if (!numeric) return "";
    return new Intl.NumberFormat("en-US").format(Number(numeric));
  };

  const validateForm = (): boolean => {
    if (!selectedUnitId) {
      setError("لطفاً واحد مورد نظر را انتخاب کنید.");
      return false;
    }

    if (!subject.trim()) {
      setError("عنوان قرارداد را وارد کنید.");
      return false;
    }

    if (!counterparty.trim()) {
      setError("نام طرف مقابل را وارد کنید.");
      return false;
    }

    if (!phone.trim() || !/^09\d{9}$/.test(phone.trim())) {
      setError("شماره موبایل را به صورت صحیح وارد کنید (۱۱ رقم با 09).");
      return false;
    }

    if (!startDate || !/^\d{4}\/\d{2}\/\d{2}$/.test(startDate)) {
      setError("تاریخ شروع را به صورت 1404/01/01 وارد کنید.");
      return false;
    }

    if (!endDate || !/^\d{4}\/\d{2}\/\d{2}$/.test(endDate)) {
      setError("تاریخ پایان را به صورت 1404/01/01 وارد کنید.");
      return false;
    }

    if (!price || parseFloat(price.replace(/,/g, "")) <= 0) {
      setError("مبلغ قرارداد را وارد کنید.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.iduser || !buildingId) {
      setError("اطلاعات کاربری کامل نیست.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setFormState("loading");
    setError(null);

    try {
      const result = await contractApi.save({
        buildingId,
        userId: user.iduser,
        state: "savenew",
        contractId: "0",
        startDate: startDate.trim(),
        endDate: endDate.trim(),
        price: price.replace(/,/g, ""),
        subject: subject.trim(),
        phone: phone.trim(),
        address: address.trim(),
        counterparty: counterparty.trim(),
        description: description.trim(),
        receipt,
      });

      if (!result.success) {
        setError(result.message || "ثبت قرارداد انجام نشد.");
        setFormState("error");
        return;
      }

      setFormState("success");
      setTimeout(() => {
        router.push("/contracts");
      }, 1500);

    } catch (err) {
      console.error("Save contract error:", err);
      setError("ثبت قرارداد با خطا مواجه شد.");
      setFormState("error");
    } finally {
      if (formState !== "success") {
        setFormState("idle");
      }
    }
  };

  // ============================================
  // Access Check
  // ============================================

  if (!buildingId) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-bold">ساختمانی انتخاب نشده</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              لطفاً ابتدا یک ساختمان را انتخاب کنید.
            </p>
            <Button className="mt-4" onClick={() => router.push("/dashboard")}>
              رفتن به داشبورد
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isManager) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <User className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
            <h2 className="text-lg font-bold">دسترسی محدود</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              فقط مدیر ساختمان می‌تواند قرارداد ثبت کند.
            </p>
            <Button className="mt-4" onClick={() => router.push("/contracts")}>
              بازگشت به لیست قراردادها
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ============================================
  // Success State
  // ============================================

  if (formState === "success") {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <FileText className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold">قرارداد با موفقیت ثبت شد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              قرارداد جدید با موفقیت در سیستم ثبت شد.
            </p>
            <Button className="mt-6" onClick={() => router.push("/contracts")}>
              بازگشت به لیست قراردادها
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
      {/* ============================================
          Header
          ============================================ */}
      <div className="flex items-center gap-3">
        <Link
          href="/contracts"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">ثبت قرارداد جدید</h1>
          <p className="mt-1 truncate text-sm text-muted-foreground">
            {selectedBuilding?.names || "ساختمان"}
          </p>
        </div>
      </div>

      {/* ============================================
          Error
          ============================================ */}
      {error && (
        <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* ============================================
          Form
          ============================================ */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              اطلاعات قرارداد
            </CardTitle>
            <CardDescription>
              اطلاعات قرارداد جدید را وارد کنید.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* ============================================
               
                ============================================ */}
            

            {/* ============================================
                عنوان
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="subject">عنوان قرارداد</Label>
              <Input
                id="subject"
                placeholder="عنوان قرارداد"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={formState === "loading"}
                maxLength={50}
              />
            </div>

            {/* ============================================
                طرف مقابل
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="counterparty">نام طرف مقابل</Label>
              <Input
                id="counterparty"
                placeholder="نام کامل شخص یا شرکت"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                disabled={formState === "loading"}
                maxLength={50}
              />
            </div>

            {/* ============================================
                تلفن
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="phone">شماره تماس</Label>
              <Input
                id="phone"
                dir="ltr"
                type="tel"
                maxLength={11}
                placeholder="۰۹۱۲۳۴۵۶۷۸۹"
                value={phone}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setPhone(value);
                }}
                disabled={formState === "loading"}
              />
            </div>

            {/* ============================================
                آدرس
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="address">آدرس</Label>
              <Input
                id="address"
                placeholder="آدرس کامل"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={formState === "loading"}
                maxLength={100}
              />
            </div>

            {/* ============================================
                تاریخ‌ها
                ============================================ */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="startDate">تاریخ شروع</Label>
                <Input
                  id="startDate"
                  dir="ltr"
                  placeholder="1404/01/01"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  disabled={formState === "loading"}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">فرمت: سال/ماه/روز</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">تاریخ پایان</Label>
                <Input
                  id="endDate"
                  dir="ltr"
                  placeholder="1404/12/29"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  disabled={formState === "loading"}
                  maxLength={10}
                />
                <p className="text-xs text-muted-foreground">فرمت: سال/ماه/روز</p>
              </div>
            </div>

            {/* ============================================
                مبلغ
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="price">مبلغ قرارداد (تومان)</Label>
              <Input
                id="price"
                dir="ltr"
                placeholder="مبلغ را وارد کنید"
                value={price}
                onChange={(e) => setPrice(formatPrice(e.target.value))}
                disabled={formState === "loading"}
              />
            </div>

            {/* ============================================
                توضیحات
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="description">توضیحات (اختیاری)</Label>
              <Textarea
                id="description"
                placeholder="توضیحات تکمیلی قرارداد"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={formState === "loading"}
                maxLength={200}
                rows={3}
              />
            </div>

            {/* ============================================
                آپلود فایل
                ============================================ */}
            <div className="space-y-2">
              <Label>فایل قرارداد (اختیاری)</Label>
              <div className="rounded-xl border-2 border-dashed p-4 transition hover:border-primary">
                {receipt ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{receipt.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(receipt.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      disabled={formState === "loading"}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      برای آپلود فایل کلیک کنید
                    </p>
                    <p className="text-xs text-muted-foreground">
                      تصویر (JPG, PNG) یا PDF - حداکثر ۵ مگابایت
                    </p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,application/pdf"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                  disabled={formState === "loading"}
                />
                {!receipt && (
                  <Label
                    htmlFor="file-upload"
                    className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-md bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80"
                  >
                    انتخاب فایل
                  </Label>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ============================================
            Actions
            ============================================ */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/contracts")}
            disabled={formState === "loading"}
          >
            انصراف
          </Button>

          <Button
            type="submit"
            className="flex-1 gap-2"
            disabled={formState === "loading"}
          >
            {formState === "loading" ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                در حال ثبت...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                ثبت قرارداد
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}