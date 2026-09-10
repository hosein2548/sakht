// src/app/buildings/new/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Upload,
  X,
  Check,
  AlertCircle,
  MapPin,
  Globe,
  Home,
  RefreshCw,
} from "lucide-react";

import { useAppStore } from "@/src/core/store/app.store";
import { useBuildingStore } from "@/src/features/building/store/building.store";
import { buildingApi } from "@/src/features/building/api/building.api";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ============================================
// Types
// ============================================

interface Ostan {
  id: string;
  code: string;
  name: string;
}

interface City {
  id: string;
  name: string;
}

// ============================================
// Component
// ============================================

export default function NewBuildingPage() {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const { restoreStoredContext } = useBuildingStore();
  const { isAuthenticated, isLoading: sessionLoading } = useSession();

  // ============================================
  // State - Form
  // ============================================

  const [name, setName] = useState("");
  const [countVahed, setCountVahed] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // ============================================
  // State - Ostan & City
  // ============================================

  const [ostanList, setOstanList] = useState<Ostan[]>([]);
  const [cityList, setCityList] = useState<City[]>([]);
  const [selectedOstan, setSelectedOstan] = useState<Ostan | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  const [isLoadingOstan, setIsLoadingOstan] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [ostanError, setOstanError] = useState<string | null>(null);
  const [cityError, setCityError] = useState<string | null>(null);

  // ============================================
  // State - Submit
  // ============================================

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ============================================
  // Load Ostan List
  // ============================================
const loadCityList = useCallback(async (codeOstan: string) => {
    if (!codeOstan) {
      setCityList([]);
      setSelectedCity(null);
      return;
    }

    setIsLoadingCity(true);
    setCityError(null);

    try {
      const result = await buildingApi.getCityList(codeOstan);
      setCityList(result);

      if (result.length > 0) {
        setSelectedCity(result[0]);
      } else {
        setSelectedCity(null);
      }
    } catch (err) {
      console.error("Load city error:", err);
      setCityError("دریافت لیست شهرها با خطا مواجه شد.");
    } finally {
      setIsLoadingCity(false);
    }
  }, []);
  const loadOstanList = useCallback(async () => {
    setIsLoadingOstan(true);
    setOstanError(null);

    try {
      const result = await buildingApi.getOstanList();
      setOstanList(result);

      if (result.length > 0) {
        setSelectedOstan(result[0]);
        // بارگذاری شهرهای استان اول
        await loadCityList(result[0].code);
      }
    } catch (err) {
      console.error("Load ostan error:", err);
      setOstanError("دریافت لیست استان‌ها با خطا مواجه شد.");
    } finally {
      setIsLoadingOstan(false);
    }
  }, []);

  // ============================================
  // Load City List
  // ============================================

  

  // ============================================
  // Initial Load
  // ============================================

  useEffect(() => {
    if (isAuthenticated && user) {
      void loadOstanList();
    }
  }, [isAuthenticated, user, loadOstanList]);

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
  // Handlers
  // ============================================

  const handleOstanChange = (value: string) => {
    const ostan = ostanList.find((o) => o.code === value);
    if (ostan) {
      setSelectedOstan(ostan);
      setSelectedCity(null);
      void loadCityList(ostan.code);
    }
  };

  const handleCityChange = (value: string) => {
    const city = cityList.find((c) => c.id === value);
    if (city) {
      setSelectedCity(city);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        setError("فایل باید تصویر (JPG, PNG, WEBP) باشد.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم فایل نباید بیشتر از ۵ مگابایت باشد.");
        return;
      }
      setImage(file);
      setError(null);
    }
  };

  const removeFile = () => {
    setImage(null);
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError("نام ساختمان را وارد کنید.");
      return false;
    }

    if (name.trim().length < 2) {
      setError("نام ساختمان باید حداقل ۲ کاراکتر باشد.");
      return false;
    }

    if (!selectedOstan) {
      setError("لطفاً استان را انتخاب کنید.");
      return false;
    }

    if (!selectedCity) {
      setError("لطفاً شهر را انتخاب کنید.");
      return false;
    }

    if (!countVahed.trim() || parseInt(countVahed) <= 0) {
      setError("تعداد واحد را به درستی وارد کنید.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user?.iduser) {
      setError("اطلاعات کاربری کامل نیست.");
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await buildingApi.createBuilding({
        name: name.trim(),
        idcity: selectedCity!.id,
        codeostan: selectedOstan!.code,
        countvahed: countVahed.trim(),
        userId: user.iduser,
        image,
      });

      if (!result.success) {
        setError(result.message || "ثبت ساختمان انجام نشد.");
        setIsSubmitting(false);
        return;
      }

      setSuccess(true);

      setTimeout(() => {
        restoreStoredContext();
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error("Create building error:", err);
      setError("ثبت ساختمان با خطا مواجه شد.");
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

  if (success) {
    return (
      <div dir="rtl" className="flex min-h-[70vh] items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-xl font-bold">ساختمان با موفقیت ثبت شد</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              ساختمان جدید با موفقیت در سیستم ثبت شد.
            </p>
            <Button className="mt-6" onClick={() => router.push("/dashboard")}>
              رفتن به داشبورد
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
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
        >
          <ArrowRight className="h-5 w-5" />
        </Link>

        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold">ثبت ساختمان جدید</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            اطلاعات ساختمان جدید را وارد کنید.
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
              <Building2 className="h-5 w-5" />
              اطلاعات ساختمان
            </CardTitle>
            <CardDescription>
              نام، موقعیت و مشخصات ساختمان را وارد کنید.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {/* ============================================
                نام ساختمان
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="building-name">
                نام ساختمان <span className="text-destructive">*</span>
              </Label>
              <Input
                id="building-name"
                placeholder="مثال: ساختمان آسمان"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                maxLength={30}
              />
              <p className="text-xs text-muted-foreground">
                حداقل ۲ و حداکثر ۳۰ کاراکتر
              </p>
            </div>

            {/* ============================================
                انتخاب استان
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="ostan">
                استان <span className="text-destructive">*</span>
              </Label>

              {isLoadingOstan ? (
                <div className="flex items-center justify-center py-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : ostanError ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{ostanError}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadOstanList()}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedOstan?.code || ""}
                  onValueChange={handleOstanChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب استان" />
                  </SelectTrigger>
                  <SelectContent>
                    {ostanList.map((ostan) => (
                      <SelectItem key={ostan.id} value={ostan.code}>
                        {ostan.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* ============================================
                انتخاب شهر
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="city">
                شهر <span className="text-destructive">*</span>
              </Label>

              {isLoadingCity ? (
                <div className="flex items-center justify-center py-3">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : cityError ? (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{cityError}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      selectedOstan && void loadCityList(selectedOstan.code)
                    }
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Select
                  value={selectedCity?.id || ""}
                  onValueChange={handleCityChange}
                  disabled={isSubmitting || cityList.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="انتخاب شهر" />
                  </SelectTrigger>
                  <SelectContent>
                    {cityList.map((city) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* ============================================
                تعداد واحد
                ============================================ */}
            <div className="space-y-2">
              <Label htmlFor="count-vahed">
                تعداد واحد <span className="text-destructive">*</span>
              </Label>
              <Input
                id="count-vahed"
                type="number"
                min="1"
                placeholder="مثال: ۱۰"
                value={countVahed}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setCountVahed(value);
                  if (error) setError(null);
                }}
                disabled={isSubmitting}
                maxLength={5}
              />
              <p className="text-xs text-muted-foreground">
                تعداد واحدهای ساختمان را وارد کنید.
              </p>
            </div>

            {/* ============================================
                آپلود تصویر
                ============================================ */}
            <div className="space-y-2">
              <Label>تصویر ساختمان (اختیاری)</Label>
              <div className="rounded-xl border-2 border-dashed p-4 transition hover:border-primary">
                {image ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                        <img
                          src={URL.createObjectURL(image)}
                          alt="پیش‌نمایش ساختمان"
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{image.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(image.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={removeFile}
                      disabled={isSubmitting}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">
                      برای آپلود تصویر کلیک کنید
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG, WEBP - حداکثر ۵ مگابایت
                    </p>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  id="building-image-upload"
                  onChange={handleFileChange}
                  disabled={isSubmitting}
                />
                {!image && (
                  <Label
                    htmlFor="building-image-upload"
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
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.push("/dashboard")}
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
                در حال ثبت...
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                ثبت ساختمان
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}