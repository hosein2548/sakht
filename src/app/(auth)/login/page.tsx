"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Phone, ArrowRight, AlertCircle } from "lucide-react";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { authApi } from "@/src/features/auth/api/auth.api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const setPhoneStore = useAuthStore((state) => state.setPhone);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // اگر قبلاً وارد شده بود، هدایت به داشبورد
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async () => {
    // اعتبارسنجی شماره
    if (phone.length !== 11) {
      setError("شماره موبایل باید ۱۱ رقم باشد.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      const result = await authApi.sendCode(phone);

      if (!result.success) {
        setError(result.message || "ارسال کد با خطا مواجه شد.");
        return;
      }

      // ذخیره شماره در Store
      setPhoneStore(phone);
      setSuccess(true);
      document.cookie = `phone=${encodeURIComponent(phone)}; path=/; max-age=600; samesite=lax`;

      // هدایت به صفحه OTP
      router.push("/login/otp");

    } catch (requestError) {
      console.error("Login error:", requestError);
      setError("ارتباط با سرور برقرار نشد.");

    } finally {
      setIsLoading(false);
    }
  };

  // هندل کردن کلید Enter
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      void handleSubmit();
    }
  };

  return (
    <div
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-background px-4 py-12 dark:from-background dark:to-background"
    >
      <Card className="w-full max-w-md border-0 shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Phone className="h-8 w-8 text-primary" />
          </div>

          <CardTitle className="text-2xl font-bold">
            ورود به حساب کاربری
          </CardTitle>

          <CardDescription className="text-sm">
            شماره موبایل خود را وارد کنید تا کد تایید برای شما ارسال شود.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* پیام موفقیت */}
          {success && (
            <Alert className="border-success/30 bg-success/10 text-success dark:bg-success/15 dark:text-success">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                کد تایید با موفقیت ارسال شد.
              </AlertDescription>
            </Alert>
          )}

          {/* پیام خطا */}
          {error && (
            <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* ورودی شماره موبایل */}
          <div className="space-y-2">
            <Input
              dir="ltr"
              type="tel"
              inputMode="numeric"
              maxLength={11}
              placeholder="۰۹۱۲۳۴۵۶۷۸۹"
              className="h-12 text-center text-lg font-medium"
              value={phone}
              onChange={(event) => {
                const value = event.target.value.replace(/\D/g, "");
                setPhone(value);
                if (error) setError("");
              }}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />

            <p className="text-center text-xs text-muted-foreground">
              شماره موبایل را با ۰ شروع کنید
            </p>
          </div>

          {/* دکمه ورود */}
          <Button
            className="h-12 w-full gap-2 text-base font-semibold"
            disabled={phone.length !== 11 || isLoading}
            onClick={() => void handleSubmit()}
          >
            {isLoading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                در حال ارسال کد...
              </>
            ) : (
              <>
                ارسال کد تایید
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* توضیحات */}
          <p className="text-center text-xs text-muted-foreground">
            با ورود به برنامه، قوانین و حریم خصوصی را می‌پذیرید.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}